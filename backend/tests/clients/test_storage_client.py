from io import BytesIO
from pathlib import Path
from uuid import UUID

import pytest

from week_eat_planner.clients.storage_client import StorageClient
from week_eat_planner.helpers import generate_uuid7

BUCKET = 'test_bucket'
FILE_SUFFIX = '.jpg'
CONTENT_TYPE = 'Image/jpg'
OBJ_ID = generate_uuid7()


@pytest.fixture
def mocked_s3_client(mocker):
    s3_client = mocker.Mock()
    mocker.patch('week_eat_planner.clients.storage_client.client', return_value=s3_client)
    return s3_client


@pytest.fixture
def mocked_upload_file():
    class TestUploadFile:
        file = BytesIO(b'test_file_content')
        filename = f'test{FILE_SUFFIX}'
        content_type = CONTENT_TYPE

    return TestUploadFile()


@pytest.fixture
def storage(mocked_s3_client) -> StorageClient:
    return StorageClient()


async def test_storage_client__upload__file_uploaded(mocker, storage, mocked_s3_client, mocked_upload_file):
    file_key = await storage.upload_image(mocked_upload_file, BUCKET, OBJ_ID)

    assert UUID(Path(file_key).stem)
    mocked_s3_client.upload_fileobj.assert_called_once_with(
        Fileobj=mocked_upload_file.file,
        Bucket=BUCKET,
        Key=mocker.ANY,
        ExtraArgs={'ContentType': mocked_upload_file.content_type},
    )


async def test_storage_client__file_no_name__error_raised(storage, mocked_upload_file):
    mocked_upload_file.filename = None

    with pytest.raises(ValueError) as exc:
        await storage.upload_image(mocked_upload_file, BUCKET, OBJ_ID)

    assert str(exc.value) == 'Uploaded file has no name'


async def test_storage_client__delete__file_deleted(storage, mocked_s3_client):
    file_key = f'{generate_uuid7()}.jpg'
    await storage.delete_file(f'{BUCKET}/{file_key}')
    mocked_s3_client.delete_object.assert_called_once_with(Bucket=BUCKET, Key=file_key)


async def test_storage_client__delete_bad_fiile_key__error_raised(storage):
    bad_file_key = 'key_without_bucket'

    with pytest.raises(ValueError) as exc:
        await storage.delete_file(bad_file_key)

    assert str(exc.value) == f'Invalid storage key: {bad_file_key}'
