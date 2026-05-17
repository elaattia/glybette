import os
import sys
import json
import time
import hashlib
from datetime import datetime, timezone

from dotenv import load_dotenv
from pathlib import Path

root = Path(__file__).parent.parent.parent
env_path = root / ".env"
if env_path.exists():
    load_dotenv(env_path)
    print(f" .env chargé depuis {env_path}")
else:
    load_dotenv()
    print("  .env non trouvé à la racine, utilisation des variables d'environnement système")

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")
MONGODB_URI  = os.getenv("MONGODB_URI", "mongodb://localhost:27017/glybette-jobs")

print("\n" + "="*60)
print("DIAGNOSTIC PIPELINE SCRAPING → RABBITMQ → JOBS-SERVICE")
print("="*60)

print("\n[1/5] Vérification de pika...")
try:
    import pika
    print(f"   pika {pika.__version__} installé")
except ImportError:
    print("   pika NON installé → pip install pika==1.3.2")
    sys.exit(1)

print(f"\n[2/5] Connexion à RabbitMQ ({RABBITMQ_URL[:40]}...)...")
try:
    params = pika.URLParameters(RABBITMQ_URL)
    params.connection_attempts = 3
    params.retry_delay = 2
    connection = pika.BlockingConnection(params)
    channel = connection.channel()
    print("   RabbitMQ accessible")
except Exception as e:
    print(f"   RabbitMQ NON accessible : {e}")
    print("\n  Solutions :")
    print("  → Docker : docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management")
    print("  → Ou installer RabbitMQ localement : https://www.rabbitmq.com/download.html")
    print(f"  → Vérifier RABBITMQ_URL dans .env (actuel: {RABBITMQ_URL})")
    sys.exit(1)

print("\n[3/5] Vérification de la queue jobs.offres...")
try:
    EXCHANGE    = "jobs"
    ROUTING_KEY = "offre.scraped"
    QUEUE       = "jobs.offres"
    DLX         = f"{EXCHANGE}.dlx"
    DLQ         = f"{QUEUE}.dlq"

    channel.exchange_declare(exchange=DLX, exchange_type="topic", durable=True)
    channel.queue_declare(queue=DLQ, durable=True, arguments={"x-message-ttl": 86_400_000})
    channel.queue_bind(queue=DLQ, exchange=DLX, routing_key=ROUTING_KEY)

    channel.exchange_declare(exchange=EXCHANGE, exchange_type="topic", durable=True)
    result = channel.queue_declare(
        queue=QUEUE, durable=True,
        arguments={
            "x-dead-letter-exchange":    DLX,
            "x-dead-letter-routing-key": ROUTING_KEY,
            "x-message-ttl":             3_600_000,
        },
    )
    msg_count = result.method.message_count
    consumer_count = result.method.consumer_count
    print(f"   Queue '{QUEUE}' OK")
    print(f"     Messages en attente : {msg_count}")
    print(f"     Consumers connectés : {consumer_count}")
    if consumer_count == 0:
        print("    Aucun consumer connecté ! Le jobs-service doit être démarré.")
except Exception as e:
    print(f"   Erreur queue : {e}")
    connection.close()
    sys.exit(1)

print("\n[4/5] Envoi d'une offre de test sur RabbitMQ...")

test_titre = f"TEST OFFRE PIPELINE {datetime.now().strftime('%H:%M:%S')}"
test_hash  = hashlib.sha256(f"{test_titre}|test|https://test.example.com/{time.time()}".encode()).hexdigest()

test_offre = {
    "hash_unique":      test_hash,
    "titre":            test_titre,
    "entreprise":       "Entreprise Test Pipeline",
    "description":      "Offre de test pour vérifier le pipeline scraping → RabbitMQ → jobs-service",
    "competences":      ["Python", "Test", "Pipeline"],
    "localisation":     "Tunis, Tunisie",
    "salaire":          None,
    "type_contrat":     "CDI",
    "lien_original":    f"https://test.example.com/{test_hash[:8]}",
    "lien":             f"https://test.example.com/{test_hash[:8]}",
    "lien_image":       None,
    "type_offre":       "emploi",
    "domaine":          "IT",
    "source_site":      "test_pipeline",
    "company_about":    None,
    "niveau_experience": "Junior",
    "taille_entreprise": None,
    "teletravail":      "Hybride",
    "nb_candidats":     None,
    "site_web_entreprise": None,
    "email_contact":    None,
    "telephone":        None,
    "categories":       None,
    "nb_sujets":        None,
    "date_publication": datetime.now(timezone.utc).isoformat(),
    "date_scraped":     datetime.now(timezone.utc).isoformat(),
}

try:
    body = json.dumps(test_offre, ensure_ascii=False).encode("utf-8")
    channel.basic_publish(
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
    print(f"   Offre de test envoyée sur RabbitMQ")
    print(f"     Titre    : {test_titre}")
    print(f"     Hash     : {test_hash[:16]}...")
    print(f"     Exchange : {EXCHANGE}")
    print(f"     Queue    : {QUEUE}")
except Exception as e:
    print(f"   Erreur envoi : {e}")
    connection.close()
    sys.exit(1)

connection.close()

print("\n[5/5] Vérification dans MongoDB (attente 5 secondes pour que jobs-service traite)...")
time.sleep(5)

try:
    from pymongo import MongoClient
    client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
    db_name = MONGODB_URI.split("/")[-1].split("?")[0] or "glybette-jobs"
    db = client[db_name]
    col = db["offres"]

    found = col.find_one({"hash_unique": test_hash})

    if found:
        print(f"   SUCCÈS ! L'offre est dans MongoDB !")
        print(f"     _id        : {found['_id']}")
        print(f"     titre      : {found['titre']}")
        print(f"     date_scraped: {found.get('date_scraped')}")
        print(f"\n   Le pipeline SCRAPING → RABBITMQ → JOBS-SERVICE → MONGODB fonctionne parfaitement !")
    else:
        print(f"    L'offre n'est pas encore dans MongoDB.")
        print(f"  Vérifications :")
        print(f"  → Le jobs-service est-il démarré ? (pnpm run dev)")
        print(f"  → Y a-t-il un consumer sur la queue ? (voir test 3)")
        print(f"  → Attendre quelques secondes et vérifier manuellement :")
        print(f"     db.offres.findOne({{hash_unique: '{test_hash[:16]}...'}})")

        total = col.count_documents({"status": "active"})
        print(f"\n  Total offres actives en MongoDB : {total}")

    client.close()

except Exception as e:
    print(f"   Erreur connexion MongoDB : {e}")
    print(f"  URI : {MONGODB_URI}")

print("\n" + "="*60)
print("DIAGNOSTIC TERMINÉ")
print("="*60)
print("\nSi le pipeline fonctionne, relancer le scraping avec :")
print("  curl -X POST http://localhost:3002/trigger -H 'Content-Type: application/json' -d '{\"source\": \"pfebooks\"}'")
print("\nOu déclencher via l'URL dans le navigateur :")
print("  http://localhost:3002/docs  (Swagger UI)")