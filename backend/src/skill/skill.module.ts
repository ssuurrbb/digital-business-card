import { Module } from '@nestjs/common';
import { SkillResolver } from './skill.resolver';
import { SkillService } from './skill.service';

@Module({
  providers: [SkillResolver, SkillService],
  exports: [SkillService],
})
export class SkillModule {}
