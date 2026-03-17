import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReportsService } from './reports.service.js';
import { QueryReportDto } from './dto/query-report.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min } from 'class-validator';

class LimitQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}

@Controller('admin/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('revenue')
  getRevenue(@Query() query: QueryReportDto) {
    return this.reportsService.getRevenue(query.from, query.to);
  }

  @Get('templates')
  getTopTemplates(@Query() query: LimitQueryDto) {
    return this.reportsService.getTopTemplates(query.limit);
  }

  @Get('customers')
  getTopCustomers(@Query() query: LimitQueryDto) {
    return this.reportsService.getTopCustomers(query.limit);
  }

  @Get('dashboard')
  getDashboardStats() {
    return this.reportsService.getDashboardStats();
  }
}
