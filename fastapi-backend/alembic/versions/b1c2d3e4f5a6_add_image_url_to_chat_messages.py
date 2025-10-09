"""Add image_url to chat_messages

Revision ID: b1c2d3e4f5a6
Revises: a16f8f6c4860
Create Date: 2025-10-09 23:44:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'b1c2d3e4f5a6'
down_revision: Union[str, None] = 'a16f8f6c4860'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add image_url column to chat_messages table
    op.add_column('chat_messages', sa.Column('image_url', sa.String(length=500), nullable=True))


def downgrade() -> None:
    # Remove image_url column from chat_messages table
    op.drop_column('chat_messages', 'image_url')
