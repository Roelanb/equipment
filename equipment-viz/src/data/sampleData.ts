import type { Enterprise, AttributeDefinition, Attribute, Equipment } from '../types/equipment';

const createAttribute = (
  name: string,
  type: AttributeDefinition['type'],
  value: any,
  required: boolean = false,
  defaultValue?: any
): Attribute => ({
  definition: {
    name,
    type,
    required,
    defaultValue,
  },
  value,
});

const createEquipment = (
  id: string,
  name: string,
  type: string,
  attributes: Attribute[] = []
): Equipment => ({
  id,
  name,
  type,
  attributes,
});

export const sampleEnterprise: Enterprise = {
  id: 'f2d121f0-7b02-4001-a4fb-5645ccde4946',
  name: 'CHI',
  regions: [
    {
      id: 'bc7cb265-7b9f-4fb2-86d1-31f3599974a2',
      code: 'AMER',
      name: 'Americas Region',
      x: 50,
      y: 50,
      width: 350,
      height: 500,
      plants: [
        {
          id: '9fac8a3e-36ba-4631-94c6-c192a83f47a6',
          name: 'Greenwood',
          regionId: 'bc7cb265-7b9f-4fb2-86d1-31f3599974a2',
          x: 20,
          y: 50,
          width: 310,
          height: 100,
          areas: [
            {
              id: '6225c2a6-6b1d-4c5d-9d1c-4b9d1c4b9d1c',
              name: 'Melting',
              plantId: '9fac8a3e-36ba-4631-94c6-c192a83f47a6',
              x: 10,
              y: 40,
              width: 90,
              height: 50,
              locations: [
                {
                  id: 'loc-green-1-1-1',
                  name: 'UpperFloor',
                  areaId: '6225c2a6-6b1d-4c5d-9d1c-4b9d1c4b9d1c',
                  x: 10,
                  y: 10,
                  width: 70,
                  height: 30,
                  equipment: [
                    createEquipment('Meltvessel', 'Melt', 'Melt', [
                      createAttribute('Model', 'string', 'RB-2000X'),
                      createAttribute('Serial Number', 'string', 'SN-12345'),
                      createAttribute('Temperature', 'number', 72.5),
                      createAttribute('Operational', 'boolean', true),
                      createAttribute('Last Maintenance', 'date', '2024-01-15'),
                      createAttribute('Speed', 'number', 120),
                    ]),
                    createEquipment('eq-002', 'Conveyor Belt 1', 'Conveyor', [
                      createAttribute('Length', 'number', 50),
                      createAttribute('Speed', 'number', 2.5),
                      createAttribute('Material', 'string', 'Rubber'),
                      createAttribute('Operational', 'boolean', true),
                    ]),
                  ],
                },
                {
                  id: 'loc-us-1-1-2',
                  name: 'Station 2',
                  areaId: '6225c2a6-6b1d-4c5d-9d1c-4b9d1c4b9d1c',
                  x: 110,
                  y: 10,
                  width: 70,
                  height: 30,
                  equipment: [
                    createEquipment('eq-003', 'Welding Robot W1', 'Robot', [
                      createAttribute('Model', 'string', 'WLD-500'),
                      createAttribute('Temperature', 'number', 450),
                      createAttribute('Operational', 'boolean', true),
                    ]),
                  ],
                },
              ],
            },
            {
              id: 'area-us-1-2',
              name: 'Quality Control',
              plantId: '9fac8a3e-36ba-4631-94c6-c192a83f47a6',
              x: 110,
              y: 40,
              width: 90,
              height: 50,
              locations: [
                {
                  id: 'loc-us-1-2-1',
                  name: 'Inspection Bay',
                  areaId: 'area-us-1-2',
                  x: 10,
                  y: 10,
                  width: 70,
                  height: 30,
                  equipment: [
                    createEquipment('eq-004', '3D Scanner', 'Scanner', [
                      createAttribute('Resolution', 'string', '0.01mm'),
                      createAttribute('Scan Speed', 'number', 1000000),
                      createAttribute('Operational', 'boolean', true),
                    ]),
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 'plant-mx-1',
          name: 'Mexico City Factory',
          regionId: 'bc7cb265-7b9f-4fb2-86d1-31f3599974a2',
          x: 20,
          y: 170,
          width: 310,
          height: 100,
          areas: [
            {
              id: 'area-mx-1-1',
              name: 'Production Floor',
              plantId: 'plant-mx-1',
              x: 10,
              y: 40,
              width: 290,
              height: 50,
              locations: [
                {
                  id: 'loc-mx-1-1-1',
                  name: 'Main Assembly',
                  areaId: 'area-mx-1-1',
                  x: 10,
                  y: 10,
                  width: 270,
                  height: 30,
                  equipment: [
                    createEquipment('eq-005', 'CNC Machine', 'Machine', [
                      createAttribute('Model', 'string', 'CNC-8000'),
                      createAttribute('Precision', 'number', 0.001),
                    ]),
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'reg-emea',
      code: 'EMEA',
      name: 'Europe, Middle East & Africa',
      x: 450,
      y: 50,
      width: 350,
      height: 500,
      plants: [
        {
          id: 'plant-de-1',
          name: 'Berlin Tech Center',
          regionId: 'reg-emea',
          x: 20,
          y: 50,
          width: 310,
          height: 100,
          areas: [
            {
              id: 'area-de-1-1',
              name: 'Electronics Assembly',
              plantId: 'plant-de-1',
              x: 10,
              y: 40,
              width: 140,
              height: 50,
              locations: [
                {
                  id: 'loc-de-1-1-1',
                  name: 'SMT Line 1',
                  areaId: 'area-de-1-1',
                  x: 10,
                  y: 10,
                  width: 120,
                  height: 30,
                  equipment: [
                    createEquipment('eq-006', 'Pick and Place Machine', 'Machine', [
                      createAttribute('Components/Hour', 'number', 25000),
                      createAttribute('Accuracy', 'string', '±0.05mm'),
                    ]),
                    createEquipment('eq-007', 'Reflow Oven', 'Oven', [
                      createAttribute('Max Temperature', 'number', 260),
                      createAttribute('Zones', 'number', 10),
                    ]),
                  ],
                },
              ],
            },
            {
              id: 'area-de-1-2',
              name: 'Testing Lab',
              plantId: 'plant-de-1',
              x: 160,
              y: 40,
              width: 140,
              height: 50,
              locations: [
                {
                  id: 'loc-de-1-2-1',
                  name: 'Environmental Testing',
                  areaId: 'area-de-1-2',
                  x: 10,
                  y: 10,
                  width: 120,
                  height: 30,
                  equipment: [
                    createEquipment('eq-008', 'Climate Chamber', 'TestEquipment', [
                      createAttribute('Temp Range', 'string', '-40°C to 180°C'),
                      createAttribute('Humidity Range', 'string', '10% to 98%'),
                    ]),
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 'plant-uk-1',
          name: 'London Distribution',
          regionId: 'reg-emea',
          x: 20,
          y: 170,
          width: 310,
          height: 100,
          areas: [
            {
              id: 'area-uk-1-1',
              name: 'Warehouse A',
              plantId: 'plant-uk-1',
              x: 10,
              y: 40,
              width: 290,
              height: 50,
              locations: [
                {
                  id: 'loc-uk-1-1-1',
                  name: 'Receiving Dock',
                  areaId: 'area-uk-1-1',
                  x: 10,
                  y: 10,
                  width: 270,
                  height: 30,
                  equipment: [
                    createEquipment('eq-009', 'Automated Sorter', 'Sorter', [
                      createAttribute('Throughput', 'number', 5000),
                      createAttribute('Accuracy', 'number', 99.9),
                    ]),
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'reg-apac',
      code: 'APAC',
      name: 'Asia Pacific',
      x: 850,
      y: 50,
      width: 350,
      height: 500,
      plants: [
        {
          id: 'plant-jp-1',
          name: 'Tokyo Innovation Hub',
          regionId: 'reg-apac',
          x: 20,
          y: 50,
          width: 310,
          height: 100,
          areas: [
            {
              id: 'area-jp-1-1',
              name: 'R&D Laboratory',
              plantId: 'plant-jp-1',
              x: 10,
              y: 40,
              width: 140,
              height: 50,
              locations: [
                {
                  id: 'loc-jp-1-1-1',
                  name: 'Prototype Workshop',
                  areaId: 'area-jp-1-1',
                  x: 10,
                  y: 10,
                  width: 120,
                  height: 30,
                  equipment: [
                    createEquipment('eq-010', '3D Printer Industrial', 'Printer', [
                      createAttribute('Build Volume', 'string', '500x500x500mm'),
                      createAttribute('Layer Resolution', 'number', 0.05),
                      createAttribute('Materials', 'array', ['PLA', 'ABS', 'PETG', 'Nylon']),
                    ]),
                    createEquipment('eq-011', 'Laser Cutter', 'Cutter', [
                      createAttribute('Power', 'number', 150),
                      createAttribute('Cutting Area', 'string', '1300x900mm'),
                    ]),
                  ],
                },
              ],
            },
            {
              id: 'area-jp-1-2',
              name: 'Clean Room',
              plantId: 'plant-jp-1',
              x: 160,
              y: 40,
              width: 140,
              height: 50,
              locations: [
                {
                  id: 'loc-jp-1-2-1',
                  name: 'Semiconductor Lab',
                  areaId: 'area-jp-1-2',
                  x: 10,
                  y: 10,
                  width: 120,
                  height: 30,
                  equipment: [
                    createEquipment('eq-012', 'Wafer Inspector', 'Inspector', [
                      createAttribute('Magnification', 'string', '50x-1000x'),
                      createAttribute('Clean Class', 'number', 100),
                    ]),
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 'plant-cn-1',
          name: 'Shanghai Production',
          regionId: 'reg-apac',
          x: 20,
          y: 170,
          width: 310,
          height: 100,
          areas: [
            {
              id: 'area-cn-1-1',
              name: 'Mass Production',
              plantId: 'plant-cn-1',
              x: 10,
              y: 40,
              width: 290,
              height: 50,
              locations: [
                {
                  id: 'loc-cn-1-1-1',
                  name: 'Line 1',
                  areaId: 'area-cn-1-1',
                  x: 10,
                  y: 10,
                  width: 130,
                  height: 30,
                  equipment: [
                    createEquipment('eq-013', 'Injection Molding Machine', 'Machine', [
                      createAttribute('Clamping Force', 'number', 2000),
                      createAttribute('Shot Size', 'number', 500),
                    ]),
                  ],
                },
                {
                  id: 'loc-cn-1-1-2',
                  name: 'Line 2',
                  areaId: 'area-cn-1-1',
                  x: 150,
                  y: 10,
                  width: 130,
                  height: 30,
                  equipment: [
                    createEquipment('eq-014', 'Assembly Robot Array', 'Robot', [
                      createAttribute('Units', 'number', 8),
                      createAttribute('Cycle Time', 'number', 15),
                    ]),
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 'plant-au-1',
          name: 'Sydney Operations',
          regionId: 'reg-apac',
          x: 20,
          y: 290,
          width: 310,
          height: 100,
          areas: [
            {
              id: 'area-au-1-1',
              name: 'Packaging Center',
              plantId: 'plant-au-1',
              x: 10,
              y: 40,
              width: 290,
              height: 50,
              locations: [
                {
                  id: 'loc-au-1-1-1',
                  name: 'Packaging Line',
                  areaId: 'area-au-1-1',
                  x: 10,
                  y: 10,
                  width: 270,
                  height: 30,
                  equipment: [
                    createEquipment('eq-015', 'Box Sealer', 'Packaging', [
                      createAttribute('Speed', 'number', 30),
                      createAttribute('Box Sizes', 'string', 'Variable'),
                    ]),
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};