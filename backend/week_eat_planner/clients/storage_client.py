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
    """Client for interacting with object storage (e.g., S3)."""

    @staticmethod
    def _get_client() -> BaseClient:
        """Initializes and returns a boto3 S3 client.

        Returns:
            An S3 client instance.
        """
        return client(
            's3',
            aws_access_key_id=settings.STORAGE_ACCESS_KEY_ID,
            aws_secret_access_key=settings.STORAGE_SECRET_ACCESS_KEY,
            endpoint_url=settings.STORAGE_HOST,
        )

    async def upload_image(self, upload_file: UploadFile, bucket: StorageBucket, obj_id: UUID) -> str:
        """
        Upload an image file to the given storage bucket and return its stored object path.
        
        Parameters:
            upload_file (UploadFile): File to upload; its filename and content_type are used to build object metadata.
            bucket (StorageBucket): Target storage bucket name.
            obj_id (UUID): UUID used as the base name for the stored object key.
        
        Returns:
            str: The stored object path in the format "bucket/object_key".
        
        Raises:
            ValueError: If the uploaded file has no filename.
        """
        if not upload_file.filename:
            raise ValueError('Uploaded file has no name')

        file_suffix = Path(upload_file.filename).suffix.lower()
        file_key = f'{obj_id}{file_suffix}'
        _client = self._get_client()

        def _upload() -> None:
            """
            Upload the in-memory file stream to the S3 client using the computed bucket and key and set the object's Content-Type.
            
            This inner helper uses the surrounding scope's `_client`, `upload_file.file`, `bucket`, `file_key`, and `upload_file.content_type` to perform the upload.
            """
            _client.upload_fileobj(
                Fileobj=upload_file.file,
                Bucket=bucket,
                Key=file_key,
                ExtraArgs={'ContentType': upload_file.content_type},
            )

        await asyncio.to_thread(_upload)

        return f'{bucket}/{file_key}'

    async def delete_file(self, file_key: str) -> None:
        """
        Delete the object identified by "bucket/key" from the configured storage backend.
        
        Parameters:
            file_key (str): Object location in the form "bucket/key".
        """
        _client = self._get_client()
        bucket, key = file_key.split('/')
        logger.debug(f'Deleting key={file_key}: {bucket=} {key=}')

        def _delete() -> None:
            """
            Delete the object specified by the enclosing `bucket` and `key` from the S3-compatible storage.
            """
            _client.delete_object(Bucket=bucket, Key=key)

        await asyncio.to_thread(_delete)
