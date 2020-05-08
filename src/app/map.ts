export interface IGeometry {
  type: string;
  coordinates: number[];
}

export interface IGeoJson {
  type: string|number;
  geometry: IGeometry;
  properties?: any;
  $key?: string;
}

export class GeoJson implements IGeoJson {
  type = 'Feature';
  geometry: IGeometry;
  constructor(public id: string | number, coordinates, public properties?) {
    this.geometry = {
      type: 'Point',
      coordinates: coordinates
    }
  }
}

export class FeatureCollection {
  type = 'FeatureCollection'
  constructor(public features: Array<GeoJson>) {}
}

// Coordinates are formatted [lng, lat]!
let UCLA_CAMPUS_BOUNDARY =
{
  "coordinates": [
    [
      [
        -118.4554956,
        34.0757422
      ],
      [
        -118.4550235,
        34.0702856
      ],
      [
        -118.4534571,
        34.0703567
      ],
      [
        -118.4527276,
        34.0706411
      ],
      [
        -118.4489939,
        34.0685615
      ],
      [
        -118.4474919,
        34.066464
      ],
      [
        -118.4482214,
        34.0635311
      ],
      [
        -118.4425566,
        34.0636555
      ],
      [
        -118.4410546,
        34.0639577
      ],
      [
        -118.4405181,
        34.0651486
      ],
      [
        -118.4395311,
        34.0665529
      ],
      [
        -118.4391019,
        34.0671928
      ],
      [
        -118.4391663,
        34.0685259
      ],
      [
        -118.4387801,
        34.0701968
      ],
      [
        -118.4381149,
        34.0710144
      ],
      [
        -118.4372351,
        34.0719386
      ],
      [
        -118.4372137,
        34.0726141
      ],
      [
        -118.4386942,
        34.0758133
      ],
      [
        -118.4386728,
        34.0765953
      ],
      [
        -118.4389517,
        34.0770041
      ],
      [
        -118.4390161,
        34.0776617
      ],
      [
        -118.4394023,
        34.0782304
      ],
      [
        -118.4407971,
        34.0775018
      ],
      [
        -118.4427927,
        34.0773773
      ],
      [
        -118.4443376,
        34.0766842
      ],
      [
        -118.4450886,
        34.0739115
      ],
      [
        -118.4455607,
        34.0736449
      ],
      [
        -118.4486291,
        34.0734672
      ],
      [
        -118.4495733,
        34.0743559
      ],
      [
        -118.4503887,
        34.0754223
      ],
      [
        -118.4534571,
        34.0769508
      ],
      [
        -118.4542081,
        34.0769153
      ],
      [
        -118.4554956,
        34.0757422
      ]
    ]
  ],
  "type": "Polygon"
};

export { UCLA_CAMPUS_BOUNDARY };
