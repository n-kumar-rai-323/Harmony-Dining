import {
  NextRequest,
  NextResponse,
} from 'next/server';

export const dynamic =
  'force-dynamic';

export async function GET(
  request: NextRequest,
) {
  const searchParams =
    request.nextUrl.searchParams;

  const startLat = Number(
    searchParams.get('startLat'),
  );

  const startLng = Number(
    searchParams.get('startLng'),
  );

  const endLat = Number(
    searchParams.get('endLat'),
  );

  const endLng = Number(
    searchParams.get('endLng'),
  );

  if (
    !Number.isFinite(startLat) ||
    !Number.isFinite(startLng) ||
    !Number.isFinite(endLat) ||
    !Number.isFinite(endLng)
  ) {
    return NextResponse.json(
      {
        message:
          'Invalid coordinates.',
      },
      {
        status: 400,
      },
    );
  }

  try {
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${startLng},${startLat};${endLng},${endLat}` +
      `?overview=full&geometries=geojson&steps=false`;

    const response =
      await fetch(url, {
        cache: 'no-store',
      });

    if (!response.ok) {
      throw new Error(
        'Routing provider error.',
      );
    }

    const data =
      await response.json();

    const route =
      data?.routes?.[0];

    if (!route) {
      return NextResponse.json(
        {
          message:
            'Route not found.',
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      distanceMeters:
        route.distance,

      durationSeconds:
        route.duration,

      coordinates:
        route.geometry.coordinates,
    });
  } catch {
    return NextResponse.json(
      {
        message:
          'Unable to load route.',
      },
      {
        status: 502,
      },
    );
  }
}