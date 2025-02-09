from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import Column, ForeignKey, Table
from sqlalchemy.orm import Mapped, mapped_column, relationship

from week_eat_planner.db.base import Base


# Association table for the many-to-many relationship between Meal and Week
meal_week_association = Table(
    'meal_week_association',
    Base.metadata,
    Column('meal_id', ForeignKey('meals.id'), primary_key=True),
    Column('week_id', ForeignKey('weeks.id'), primary_key=True),
)


class User(Base):
    __tablename__ = 'users'

    id: Mapped[UUID] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(nullable=False)
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc)
    )
    is_active: Mapped[bool] = mapped_column(default=True)


class Meal(Base):
    __tablename__ = 'meals'

    id: Mapped[UUID] = mapped_column(primary_key=True)
    weeks: Mapped[list['Week']] = relationship('Week', secondary=meal_week_association, back_populates='meals')


class Week(Base):
    __tablename__ = 'weeks'

    id: Mapped[UUID] = mapped_column(primary_key=True)
    user_id: Mapped[UUID] = mapped_column(ForeignKey('users.id'), nullable=True)
    week_start: Mapped[str] = mapped_column()
    meals: Mapped[list[Meal]] = relationship('Meal', secondary=meal_week_association, back_populates='weeks')
