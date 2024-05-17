import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { TripService } from './trip.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { AuthGuard } from '../guards/auth/auth.guard';
import { CurrentUser } from '../decorators/currentuser/currentuser.decorator';
import { User } from '../user/user.entity';

@Controller('driver/trip')
@UseGuards(AuthGuard)
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Get()
  findAll(@CurrentUser() user: User) {
    // Just for testing pourposes
    return this.tripService.findAll(user);
  }

  @Post(':id/confirm')
  confirm(@Param('id') id: string, @Body() updateTripDto: UpdateTripDto, @CurrentUser() user: User) {
    return this.tripService.confirm(user, +id);
  }

  @Post(':id/finish')
  finish(@Param('id') id: string, @Body() updateTripDto: UpdateTripDto, @CurrentUser() user: User) {
    return this.tripService.finish(user, +id);
  }

  @Delete(':id')
  cancel(@Param('id') id: string, @CurrentUser() user: User) {
    return this.tripService.cancel(user, +id);
  }
}

@Controller('passenger/trip')
@UseGuards(AuthGuard)
export class PassengerTripController {
  constructor(private readonly tripService: TripService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() createTripDto: CreateTripDto) {
    return this.tripService.create(user, createTripDto);
  }
}
