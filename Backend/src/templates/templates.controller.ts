import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TemplatesService } from './templates.service.js';
import { CreateTemplateDto } from './dto/create-template.dto.js';
import { UpdateTemplateDto } from './dto/update-template.dto.js';
import { QueryTemplateDto } from './dto/query-template.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';

@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  findAll(@Query() query: QueryTemplateDto) {
    return this.templatesService.findAll(query);
  }

  @Get('featured')
  findFeatured() {
    return this.templatesService.findFeatured();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.templatesService.findBySlug(slug);
  }
}

@Controller('admin/templates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminTemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  @Roles('ADMIN', 'STAFF')
  findAll(@Query() query: QueryTemplateDto) {
    return this.templatesService.findAllAdmin(query);
  }

  @Post()
  @Roles('ADMIN', 'STAFF')
  create(@Body() dto: CreateTemplateDto) {
    return this.templatesService.create(dto);
  }

  @Patch(':id')
  @Roles('ADMIN', 'STAFF')
  update(@Param('id') id: string, @Body() dto: UpdateTemplateDto) {
    return this.templatesService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.templatesService.remove(id);
  }
}
