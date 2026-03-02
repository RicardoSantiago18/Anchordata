"""merge all heads

Revision ID: 1cbfd684a8d9
Revises: 23214191b29d, b9187cf56695, fb38535a53dc
Create Date: 2026-03-02 09:58:36.134854

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '1cbfd684a8d9'
down_revision = ('23214191b29d', 'b9187cf56695', 'fb38535a53dc')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
