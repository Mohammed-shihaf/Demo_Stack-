import os
from pathlib import Path
from pydantic import BaseModel

class Settings(BaseModel):
    app_name: str = "Demo_Stack Python Unified Backend"
    port: int = int(os.getenv("PORT", "8000"))
    grpc_port: int = int(os.getenv("GRPC_PORT", "50051"))
    grpc_host: str = os.getenv("GRPC_HOST", "0.0.0.0")
    mongo_uri: str = os.getenv("MONGO_URI", "mongodb://localhost:27017/demo_stack")
    elasticsearch_node: str = os.getenv("ELASTICSEARCH_NODE", "http://localhost:9200")
    elasticsearch_index: str = os.getenv("ELASTICSEARCH_INDEX", "records")
    aws_region: str = os.getenv("AWS_REGION", "us-east-1")
    aws_endpoint: str | None = os.getenv("AWS_ENDPOINT", "http://localhost:4566" if os.getenv("ENV") == "test" else None)
    sns_topic_arn: str = os.getenv("SNS_TOPIC_ARN", "arn:aws:sns:us-east-1:000000000000:records-topic")
    ses_from_email: str = os.getenv("SES_FROM_EMAIL", "notifications@example.com")
    proto_path: str = str(Path(__file__).resolve().parents[3] / "shared" / "proto" / "record.proto")

settings = Settings()
