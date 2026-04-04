import asyncio
from pathlib import Path
from uuid import UUID

from boto3 import client
from botocore.client import BaseClient
from fastapi import UploadFile
from loguru import logger

from week_eat_planner.config import settings
from week_eat_planner.constants import StorageBucket


class StorageClient:
    @staticmethod
    def _get_client() -> BaseClient:
        return client(
            's3',
            aws_access_key_id=settings.STORAGE_ACCESS_KEY_ID,
            aws_secret_access_key=settings.STORAGE_SECRET_ACCESS_KEY,
            endpoint_url=settings.STORAGE_HOST,
        )

    async def upload_image(self, upload_file: UploadFile, bucket: StorageBucket, obj_id: UUID) -> str:
        if not upload_file.filename:
            raise ValueError('Uploaded file has no name')

        file_suffix = Path(upload_file.filename).suffix.lower()
        file_key = f'{obj_id}{file_suffix}'
        _client = self._get_client()

        def _upload() -> None:
            _client.upload_fileobj(
                Fileobj=upload_file.file,
                Bucket=bucket,
                Key=file_key,
                ExtraArgs={'ContentType': upload_file.content_type},
            )

        await asyncio.to_thread(_upload)

        return f'{bucket}/{file_key}'

    async def delete_file(self, file_key: str) -> None:
        _client = self._get_client()
        bucket, key = file_key.split('/')
        logger.debug(f'Deleting key={file_key}: {bucket=} {key=}')

        def _delete() -> None:
            _client.delete_object(Bucket=bucket, Key=key)

        await asyncio.to_thread(_delete)
