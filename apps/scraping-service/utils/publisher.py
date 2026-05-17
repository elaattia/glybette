import json
import os
import time
from datetime import datetime, timezone
from loguru import logger

try:
    import pika
    PIKA_OK = True
except ImportError:
    PIKA_OK = False
    logger.warning("pika non installé — RabbitMQ désactivé (pip install pika==1.3.2)")

RABBITMQ_URL = os.getenv("RABBITMQ_URL",         "amqp://guest:guest@localhost:5672/")
EXCHANGE     = os.getenv("RABBITMQ_EXCHANGE",     "jobs")
ROUTING_KEY  = os.getenv("RABBITMQ_ROUTING_KEY",  "offre.scraped")
QUEUE        = "jobs.offres"   
DLX          = f"{EXCHANGE}.dlx"
DLQ          = f"{QUEUE}.dlq"

_connection = None
_channel    = None


def _get_channel():
    global _connection, _channel

    try:
        if _connection and _connection.is_open and _channel and _channel.is_open:
            return _channel
    except Exception:
        pass

    if not PIKA_OK:
        return None

    try:
        params = pika.URLParameters(RABBITMQ_URL)
        params.heartbeat = 60
        params.blocked_connection_timeout = 15

        _connection = pika.BlockingConnection(params)
        _channel    = _connection.channel()

        _channel.exchange_declare(exchange=DLX, exchange_type="topic", durable=True)
        _channel.queue_declare(
            queue=DLQ, durable=True,
            arguments={"x-message-ttl": 86_400_000},   
        )
        _channel.queue_bind(queue=DLQ, exchange=DLX, routing_key=ROUTING_KEY)

        _channel.exchange_declare(exchange=EXCHANGE, exchange_type="topic", durable=True)

        _channel.queue_declare(
            queue=QUEUE, durable=True,
            arguments={
                "x-dead-letter-exchange":    DLX,
                "x-dead-letter-routing-key": ROUTING_KEY,
                "x-message-ttl":             3_600_000,
            },
        )
        _channel.queue_bind(queue=QUEUE, exchange=EXCHANGE, routing_key=ROUTING_KEY)

        logger.success(f"[publisher] RabbitMQ OK — exchange={EXCHANGE} queue={QUEUE}")
        return _channel

    except Exception as e:
        logger.error(f"[publisher] Connexion échouée: {e}")
        _reset()
        return None


def publish_offre(offre_doc: dict) -> bool:
    """
    Publie un document offre JSON dans RabbitMQ.
    Retry automatique ×3 avec backoff exponentiel.
    Retourne True si publié, False sinon.
    """
    if not PIKA_OK:
        return False

    for attempt in range(3):
        try:
            ch = _get_channel()
            if not ch:
                time.sleep(2 ** attempt)
                continue

            body = json.dumps(
                _serialize_doc(offre_doc),
                ensure_ascii=False,
            ).encode("utf-8")

            ch.basic_publish(
                exchange=EXCHANGE,
                routing_key=ROUTING_KEY,
                body=body,
                properties=pika.BasicProperties(
                    content_type="application/json",
                    content_encoding="utf-8",
                    delivery_mode=2,  
                ),
                mandatory=False,
            )
            return True

        except (pika.exceptions.AMQPConnectionError,
                pika.exceptions.StreamLostError) as e:
            logger.warning(f"[publisher] AMQP error (tentative {attempt + 1}/3): {e}")
            _reset()
            time.sleep(2 ** attempt)
        except Exception as e:
            logger.error(f"[publisher] Erreur inattendue: {e}")
            _reset()
            return False

    logger.error("[publisher] Échec après 3 tentatives")
    return False


def ping() -> bool:
    """Vérifie que RabbitMQ est joignable."""
    try:
        return (_get_channel() or None) is not None
    except Exception:
        return False


def close():
    global _connection, _channel
    try:
        if _channel and _channel.is_open:
            _channel.close()
        if _connection and _connection.is_open:
            _connection.close()
    except Exception:
        pass
    _reset()


def _reset():
    global _connection, _channel
    _connection = None
    _channel    = None


def _serialize_doc(doc: dict) -> dict:
    """Rend le doc JSON-sérialisable : datetime → ISO, ObjectId → str."""
    out = {}
    for k, v in doc.items():
        if isinstance(v, datetime):
            out[k] = v.replace(tzinfo=timezone.utc).isoformat() if v.tzinfo is None else v.isoformat()
        elif isinstance(v, list):
            out[k] = [_serialize_doc(i) if isinstance(i, dict) else i for i in v]
        elif type(v).__name__ == "ObjectId":
            out[k] = str(v)
        else:
            out[k] = v
    return out