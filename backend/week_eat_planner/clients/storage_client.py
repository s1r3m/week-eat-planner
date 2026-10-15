"""Client for interacting with object storage services."""

import asyncio
from pathlib import Path
from uuid import UUID

from boto3 import client
from botocore.client import BaseClient
from fastapi import UploadFile
from loguru import logger

from week_eat_planner.config import settings
from week_eat_planner.constants import StorageBucket
from week_eat_planner.helpers import generate_uuid7


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
        """Upload an image under a generated UUID filename in the specified bucket.

        The upload runs in a worker thread. The filename extension is lowercased;
        obj_id is accepted but is not used to construct the key. Validation of the
        file's MIME type and size is the caller's responsibility.

        Args:
            upload_file: File whose content is uploaded from its current stream position.
            bucket: Destination storage bucket.
            obj_id: Associated record ID; currently unused.

        Returns:
            Storage reference in bucket/key format, rather than a public URL.

        Raises:
            ValueError: If the uploaded file has no filename.
        """
        if not upload_file.filename:
            raise ValueError('Uploaded file has no name')

        file_suffix = Path(upload_file.filename).suffix.lower()
        file_key = f'{generate_uuid7()}{file_suffix}'
        _client = self._get_client()

        def _upload() -> None:
            """Blocking boto3 upload run inside a thread."""
            _client.upload_fileobj(
                Fileobj=upload_file.file,
                Bucket=bucket,
                Key=file_key,
                ExtraArgs={'ContentType': upload_file.content_type},
            )

        await asyncio.to_thread(_upload)

        return f'{bucket}/{file_key}'

    async def delete_file(self, file_key: str) -> None:
        """Delete an object identified by a bucket/key storage reference.

        The blocking storage request runs in a worker thread.

        Args:
            file_key: Storage reference containing a bucket and object key separated by /.

        Raises:
            ValueError: If file_key contains no / separator.
        """
        _client = self._get_client()
        try:
            bucket, key = file_key.split('/', maxsplit=1)
        except ValueError as exc:
            raise ValueError(f'Invalid storage key: {file_key}') from exc
        logger.debug(f'Deleting key={file_key}: {bucket=} {key=}')

        def _delete() -> None:
            """Blocking boto3 delete run inside a thread."""
            _client.delete_object(Bucket=bucket, Key=key)

        await asyncio.to_thread(_delete)
