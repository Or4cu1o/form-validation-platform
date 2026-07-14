import { FormTopicsController } from './form-topics.controller';
import { FormTopicsService } from './form-topics.service';

describe('FormTopicsController', () => {
  let controller: FormTopicsController;
  let createMock: jest.Mock;
  let updateMock: jest.Mock;
  let setActiveMock: jest.Mock;

  beforeEach(() => {
    createMock = jest.fn().mockResolvedValue({ id: 'topic-1' });
    updateMock = jest.fn().mockResolvedValue({ id: 'topic-1' });
    setActiveMock = jest.fn().mockResolvedValue({ id: 'topic-1' });
    const formTopicsService = {
      create: createMock,
      update: updateMock,
      setActive: setActiveMock,
    } as unknown as FormTopicsService;
    controller = new FormTopicsController(formTopicsService);
  });

  test('create delegates to FormTopicsService.create with the template id and dto', async () => {
    const dto = { title: 'Governança', order: 1 };

    await controller.create('template-1', dto);

    expect(createMock).toHaveBeenCalledWith('template-1', dto);
  });

  test('update delegates to FormTopicsService.update with the id and dto', async () => {
    await controller.update('topic-1', { title: 'Novo titulo' });

    expect(updateMock).toHaveBeenCalledWith('topic-1', { title: 'Novo titulo' });
  });

  test('deactivate/activate delegate to FormTopicsService.setActive', async () => {
    await controller.deactivate('topic-1');
    expect(setActiveMock).toHaveBeenCalledWith('topic-1', false);

    await controller.activate('topic-1');
    expect(setActiveMock).toHaveBeenCalledWith('topic-1', true);
  });
});
