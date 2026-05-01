"""WEP-72_add_oauth_provider

Revision ID: 79ee0940e750
Revises: aca4e622de12
Create Date: 2026-04-29 15:59:24.782515

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '79ee0940e750'
down_revision: Union[str, None] = 'aca4e622de12'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('avatar_key', sa.String(), nullable=True))
    op.add_column('users', sa.Column('oauth_provider', sa.String(), nullable=True))
    op.add_column('users', sa.Column('oauth_id', sa.String(), nullable=True))
    op.alter_column('users', 'username',
               existing_type=sa.VARCHAR(),
               nullable=False)
    op.alter_column('users', 'hashed_password',
               existing_type=sa.VARCHAR(),
               nullable=True)
    op.create_unique_constraint('uq_users_oauth_provider_oauth_id', 'users', ['oauth_provider', 'oauth_id'])


def downgrade() -> None:
    # Cannot safely restore hashed_password NOT NULL if OAuth users with NULL
    # hashed_password exist. Manual data cleanup required before downgrading.
    raise NotImplementedError(
        "Downgrade is not supported automatically. OAuth users may have NULL "
        "hashed_password, which would violate the NOT NULL constraint being restored. "
        "Delete or backfill all OAuth-only rows before running this downgrade manually."
    )
