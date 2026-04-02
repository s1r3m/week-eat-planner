import pytest

from week_eat_planner.clients.storage_client import StorageClient
from week_eat_planner.helpers import generate_uuid7

BUCKET = 'test_bucket'
FILE_SUFFIX = '.jpg'
CONTENT_TYPE = 'Image/jpg'
OBJ_ID = generate_uuid7()

EXPECTED_FILE_KEY = f'{BUCKET}/{OBJ_ID}{FILE_SUFFIX}'


@pytest.fixture
def mocked_s3_client(mocker):
    s3_client = mocker.Mock()
    mocker.patch('week_eat_planner.clients.storage_client.client', return_value=s3_client)
    return s3_client


@pytest.fixture
def mocked_upload_file():
    class TestUploadFile:
        file = b'test_file_content'
        filename = f'test{FILE_SUFFIX}'
        content_type = CONTENT_TYPE

    return TestUploadFile()


@pytest.fixture
def storage(mocked_s3_client) -> StorageClient:
    return StorageClient()


async def test_storage_client__upload__file_uploaded(storage, mocked_s3_client, mocked_upload_file):
    file_key = await storage.upload_image(mocked_upload_file, BUCKET, OBJ_ID)

    assert file_key == EXPECTED_FILE_KEY
    mocked_s3_client.upload_fileobj.assert_called_once_with(
        Fileobj=mocked_upload_file.file,
        Bucket=BUCKET,
        Key=f'{OBJ_ID}{FILE_SUFFIX}',
        ExtraArgs={'ContentType': mocked_upload_file.content_type},
    )


async def test_storage_client__delete__file_deleted(storage, mocked_s3_client):
    await storage.delete_file(EXPECTED_FILE_KEY)
    mocked_s3_client.delete_object.assert_called_once_with(Bucket=BUCKET, Key=f'{OBJ_ID}{FILE_SUFFIX}')
