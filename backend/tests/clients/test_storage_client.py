from io import BytesIO

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
    """
    Create and patch a mocked S3 client and return it for use in tests.
    
    Returns:
        The mocked S3 client instance (mocker.Mock) that was patched into
        week_eat_planner.clients.storage_client.client.
    """
    s3_client = mocker.Mock()
    mocker.patch('week_eat_planner.clients.storage_client.client', return_value=s3_client)
    return s3_client


@pytest.fixture
def mocked_upload_file():
    """
    Create a lightweight test upload file object that mimics an uploaded file.
    
    Returns:
        TestUploadFile: An object with attributes:
            - file: a BytesIO stream containing test file bytes.
            - filename: a filename string composed from `FILE_SUFFIX` (e.g., 'test.jpg').
            - content_type: the MIME type defined by `CONTENT_TYPE`.
    """
    class TestUploadFile:
        file = BytesIO(b'test_file_content')
        filename = f'test{FILE_SUFFIX}'
        content_type = CONTENT_TYPE

    return TestUploadFile()


@pytest.fixture
def storage(mocked_s3_client) -> StorageClient:
    """
    Create and return a StorageClient instance configured to use the mocked S3 client.
    
    Returns:
        StorageClient: A StorageClient instance wired to the patched/mocked S3 client provided by the test fixture.
    """
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


async def test_storage_client__file_no_name__error_raised(storage, mocked_upload_file):
    mocked_upload_file.filename = None

    with pytest.raises(ValueError) as exc:
        await storage.upload_image(mocked_upload_file, BUCKET, OBJ_ID)

    assert str(exc.value) == 'Uploaded file has no name'


async def test_storage_client__delete__file_deleted(storage, mocked_s3_client):
    await storage.delete_file(EXPECTED_FILE_KEY)
    mocked_s3_client.delete_object.assert_called_once_with(Bucket=BUCKET, Key=f'{OBJ_ID}{FILE_SUFFIX}')
