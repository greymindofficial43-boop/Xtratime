import { Controller, Post, Body } from '@nestjs/common';

@Controller()
export class TestBodyController {
  @Post('test-body')
  echo(@Body() body: any) {
    const length = body && typeof body === 'object'
      ? JSON.stringify(body).length
      : String(body ?? '').length;
    return { ok: true, length };
  }
}

export default TestBodyController;
