import os
import sys
from pathlib import Path
from dotenv import load_dotenv

root = Path(__file__).parent.parent.parent
env_path = root / ".env"
if env_path.exists():
    load_dotenv(env_path)
    print(f" .env chargé")

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")

try:
    import pika
except ImportError:
    print(" pip install pika==1.3.2")
    sys.exit(1)

print(f"\nConnexion à RabbitMQ...")
try:
    params = pika.URLParameters(RABBITMQ_URL)
    conn = pika.BlockingConnection(params)
    ch = conn.channel()
    print(" Connecté")
except Exception as e:
    print(f" {e}")
    sys.exit(1)

print("\nNettoyage des exchanges et queues existants...")

items_to_delete = [
    ("queue",    "jobs.offres"),
    ("queue",    "jobs.offres.dlq"),
    ("exchange", "jobs"),
    ("exchange", "jobs.dlx"),
]

for kind, name in items_to_delete:
    try:
        if kind == "queue":
            ch.queue_delete(queue=name)
            print(f"  Queue '{name}' supprimée")
        else:
            ch.exchange_delete(exchange=name)
            print(f"   Exchange '{name}' supprimé")
    except Exception as e:
        print(f"  {kind} '{name}' : {e} (peut-être déjà absent)")
        try:
            conn.close()
        except Exception:
            pass
        conn = pika.BlockingConnection(pika.URLParameters(RABBITMQ_URL))
        ch = conn.channel()

print("\nCréation de la topologie correcte...")

EXCHANGE    = "jobs"
ROUTING_KEY = "offre.scraped"
QUEUE       = "jobs.offres"
DLX         = f"{EXCHANGE}.dlx"
DLQ         = f"{QUEUE}.dlq"

try:
    ch.exchange_declare(exchange=DLX, exchange_type="topic", durable=True)
    print(f"  Exchange '{DLX}' (topic) créé")

    ch.queue_declare(
        queue=DLQ,
        durable=True,
        arguments={
            "x-message-ttl": 86_400_000
        }
    )
    print(f"  Queue '{DLQ}' créée")

    ch.queue_bind(queue=DLQ, exchange=DLX, routing_key=ROUTING_KEY)
    print(f"  '{DLQ}' bindée à '{DLX}' avec routing_key='{ROUTING_KEY}'")

    ch.exchange_declare(exchange=EXCHANGE, exchange_type="topic", durable=True)
    print(f"  Exchange '{EXCHANGE}' (topic) créé")

    result = ch.queue_declare(
        queue=QUEUE,
        durable=True,
        arguments={
            "x-dead-letter-exchange":    DLX,
            "x-dead-letter-routing-key": ROUTING_KEY,
            "x-message-ttl":             3_600_000,
        },
    )
    print(f"  Queue '{QUEUE}' créée")

    ch.queue_bind(queue=QUEUE, exchange=EXCHANGE, routing_key=ROUTING_KEY)
    print(f"  '{QUEUE}' bindée à '{EXCHANGE}' avec routing_key='{ROUTING_KEY}'")

except Exception as e:
    print(f" Erreur création topologie : {e}")
    conn.close()
    sys.exit(1)

conn.close()

print("\n" + "="*50)
print("Topologie RabbitMQ corrigée !")
print("="*50)
print("\nProchaines étapes :")
print("1. Redémarrer jobs-service  (pnpm run dev)")
print("2. Redémarrer scraping-service  (python main.py)")
print("3. Vérifier : python test_pipeline.py")