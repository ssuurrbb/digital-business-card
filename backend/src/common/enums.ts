import { registerEnumType } from '@nestjs/graphql';
import { LinkKind, SkillCategory } from '@prisma/client';

registerEnumType(LinkKind, {
  name: 'LinkKind',
  description: 'Тип профессиональной ссылки в профиле',
});

registerEnumType(SkillCategory, {
  name: 'SkillCategory',
  description: 'Категория навыка в справочнике',
});

export { LinkKind, SkillCategory };
