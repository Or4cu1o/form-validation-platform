import { FormTemplatesController } from './form-templates.controller';
import { FormTemplatesService } from './form-templates.service';

describe('FormTemplatesController', () => {
  let controller: FormTemplatesController;
  let findAllMock: jest.Mock;
  let findOneWithStructureMock: jest.Mock;
  let createMock: jest.Mock;
  let updateMock: jest.Mock;
  let setActiveMock: jest.Mock;

  beforeEach(() => {
    findAllMock = jest.fn().mockResolvedValue([]);
    findOneWithStructureMock = jest.fn().mockResolvedValue({ id: 'template-1' });
    createMock = jest.fn().mockResolvedValue({ id: 'template-1' });
    updateMock = jest.fn().mockResolvedValue({ id: 'template-1' });
    setActiveMock = jest.fn().mockResolvedValue({ id: 'template-1' });
    const formTemplatesService = {
      findAll: findAllMock,
      findOneWithStructure: findOneWithStructureMock,
      create: createMock,
      update: updateMock,
      setActive: setActiveMock,
    } as unknown as FormTemplatesService;
    controller = new FormTemplatesController(formTemplatesService);
  });

  test('findAll treats the includeInactive query param as boolean "true" only', async () => {
    await controller.findAll('true');
    expect(findAllMock).toHaveBeenCalledWith(true);

    await controller.findAll(undefined);
    expect(findAllMock).toHaveBeenCalledWith(false);
  });

  test('findOne delegates to findOneWithStructure with id and includeInactive', async () => {
    await controller.findOne('template-1', 'true');

    expect(findOneWithStructureMock).toHaveBeenCalledWith('template-1', true);
  });

  test('create delegates to FormTemplatesService.create with the dto', async () => {
    const dto = { name: 'N1', description: 'desc' };

    await controller.create(dto);

    expect(createMock).toHaveBeenCalledWith(dto);
  });

  test('update delegates to FormTemplatesService.update with the id and dto', async () => {
    await controller.update('template-1', { name: 'Novo nome' });

    expect(updateMock).toHaveBeenCalledWith('template-1', { name: 'Novo nome' });
  });

  test('deactivate/activate delegate to FormTemplatesService.setActive', async () => {
    await controller.deactivate('template-1');
    expect(setActiveMock).toHaveBeenCalledWith('template-1', false);

    await controller.activate('template-1');
    expect(setActiveMock).toHaveBeenCalledWith('template-1', true);
  });
});
