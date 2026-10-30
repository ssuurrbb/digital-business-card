import { Module } from '@nestjs/common';
import { ProfileModule } from '../profile/profile.module';
import { ExperienceResolver } from './experience.resolver';
import { ExperienceService } from './experience.service';

@Module({
  imports: [ProfileModule],
  providers: [ExperienceResolver, ExperienceService],
  exports: [ExperienceService],
})
export class ExperienceModule {}
