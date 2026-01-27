"""Initial schema with new user authentication system

Revision ID: new_auth_system
Revises: 3363823e3a47_initial_schema
Create Date: 2026-01-27 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'new_auth_system'
down_revision = '3363823e3a47_initial_schema'
branch_labels = None
depends_on = None


def upgrade():
    # Adicionar coluna email à tabela users
    op.add_column('users', sa.Column('email', sa.String(120), nullable=False))
    op.create_unique_constraint('uq_users_email', 'users', ['email'])
    op.create_index('ix_users_email', 'users', ['email'])
    
    # Adicionar coluna is_active à tabela users
    op.add_column('users', sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'))
    
    # Adicionar coluna created_at à tabela users
    op.add_column('users', sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()))
    
    # Renomear coluna function para role
    op.alter_column('users', 'function', new_column_name='role')
    
    # Atualizar default da coluna role
    op.alter_column('users', 'role', existing_type=sa.String(50), nullable=False, server_default='engenheiro')
    
    # Mudar name para não unique (já que temos email único)
    op.drop_constraint('uq_users_name', 'users', type_='unique')


def downgrade():
    # Reverter mudanças
    op.create_unique_constraint('uq_users_name', 'users', ['name'])
    
    op.drop_column('users', 'created_at')
    op.drop_column('users', 'is_active')
    op.drop_index('ix_users_email', 'users')
    op.drop_constraint('uq_users_email', 'users', type_='unique')
    op.drop_column('users', 'email')
    
    op.alter_column('users', 'role', new_column_name='function')
