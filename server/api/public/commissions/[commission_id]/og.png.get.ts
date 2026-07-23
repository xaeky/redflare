import satori from 'satori';
import sharp from 'sharp';
import { CommissionStatusType } from '~~/shared/enums/Commissions';

// Lazy-loaded font buffers — populated on first request via serverAssets
// let _fontRegular: Buffer | null = null;
// let _fontBold: Buffer | null = null;
// let _logoSvg: Buffer | null = null;
let assets = {} as Record<string, Buffer>;

async function loadResources() {
  // Load fonts
  const fontStorage = useStorage('assets:fonts');
  assets.fontRegular = Buffer.from(await fontStorage.getItemRaw('Geist-Regular.ttf') as Uint8Array);
  assets.fontBold = Buffer.from(await fontStorage.getItemRaw('Geist-Bold.ttf') as Uint8Array);
  // Load SVG assets as strings
  const svgStorage = useStorage('assets:svg');
  assets.logoSvg = Buffer.from(await svgStorage.getItem<string>('xa_logotype.svg') as string);
  assets.userIconSvg = Buffer.from(await svgStorage.getItem<string>('lucide-user_round.svg') as string);
  // Load images
  const imgStorage = useStorage('assets:img');
  assets.background = Buffer.from(await imgStorage.getItemRaw('REDFLARE.GENERIC_SEO_BG.jpg') as Uint8Array);
}

const STATUS_LABELS: Partial<Record<CommissionStatusType, string>> = {
  [CommissionStatusType.InSetup]: 'In Setup',
  [CommissionStatusType.NextUp]: 'Next Up',
  [CommissionStatusType.InDevelopment]: 'In Development',
  [CommissionStatusType.AwaitingResponse]: 'Awaiting Response',
  [CommissionStatusType.Showtime]: 'Showtime',
  [CommissionStatusType.Maintenance]: 'Maintenance',
  [CommissionStatusType.Settled]: 'Settled',
  [CommissionStatusType.Missing]: 'Missing',
  [CommissionStatusType.Backlog]: 'Backlog',
  [CommissionStatusType.Cancelled]: 'Cancelled',
};

const STATUS_COLORS: Partial<Record<CommissionStatusType, string>> = {
  [CommissionStatusType.InSetup]: '#06b6d4',
  [CommissionStatusType.NextUp]: '#3b82f6',
  [CommissionStatusType.InDevelopment]: '#eab308',
  [CommissionStatusType.AwaitingResponse]: '#f97316',
  [CommissionStatusType.Showtime]: '#22c55e',
  [CommissionStatusType.Maintenance]: '#a855f7',
  [CommissionStatusType.Settled]: '#71717a',
  [CommissionStatusType.Missing]: '#ef4444',
  [CommissionStatusType.Backlog]: '#64748b',
  [CommissionStatusType.Cancelled]: '#dc2626',
};



export default defineEventHandler(async (event) => {
  const { data: rawCommission } = await validateCommission(event, true, true);
  if (!rawCommission) throw createError({ status: 404, statusText: 'Commission not found' });
  const commission = rawCommission as unknown as PublicSerializedCommission;

  await loadResources();

  const status = commission.data.status as CommissionStatusType;
  const statusLabel = STATUS_LABELS[status] ?? 'Commission';
  const statusColor = STATUS_COLORS[status] ?? '#71717a';

  const formattedDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(
    new Date(commission.data.created_at as string)
  );

  // Replace "currentColor" in SVG with actual color for better compatibility with satori
  const logoSvg = assets.logoSvg!.toString('utf-8').replace(/currentColor/g, '#06b6d4');

  const element = {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        backgroundImage: `url(data:image/jpeg;base64,${assets.background.toString('base64')})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '60px',
        fontFamily: 'Geist',
      },
      children: [
        // Header row: status badge and logo
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '32px',
            },
            children: [
              {
                type: 'img',
                props: {
                  src: `data:image/svg+xml;base64,${Buffer.from(logoSvg).toString('base64')}`,
                  height: 60,
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    border: `2px solid ${statusColor}`,
                    color: statusColor,
                    padding: '6px 20px',
                    borderRadius: '9999px',
                    fontSize: '24px',
                    fontWeight: 600,
                  },
                  children: [statusLabel],
                },
              },
            ],
          },
        },
        // Body: Commission title and ID
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              marginBottom: '24px'
            },
            children: [
              {
                type: 'span',
                props: {
                  style: { color: '#ffffff', fontWeight: 700, fontSize: '64px' },
                  children: ['Commission'],
                },
              },
              {
                type: 'span',
                props: {
                  style: { color: '#818192', fontWeight: 400, fontSize: '32px', marginTop: '8px' },
                  children: [`${commission.data._id}`],
                },
              }
            ],
          },
        },
        // Footer: creation date
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              justifyContent: 'space-between'
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    color: '#818192',
                    fontSize: '24px',
                  },
                  children: [
                    {
                      type: 'img',
                      props: {
                        src: `data:image/svg+xml;base64,${Buffer.from(assets.userIconSvg).toString('base64')}`,
                        width: 24,
                        height: 24,
                        style: { marginRight: '8px' },
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        children: [`${commission.customer.name}`],
                      },
                    },
                  ],
                },
              },
              {
                type: 'span',
                props: {
                  style: { color: '#818192', fontSize: '24px' },
                  children: [formattedDate],
                },
              },
            ],
          },
        },
        // Cyan bar at the bottom
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: '8px',
              backgroundColor: '#06b6d4',
            },
          },
        },
      ],
    },
  };

  const svg = await satori(element as Parameters<typeof satori>[0], {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Geist', data: assets.fontRegular!.buffer as ArrayBuffer, weight: 400, style: 'normal' },
      { name: 'Geist', data: assets.fontBold!.buffer as ArrayBuffer, weight: 700, style: 'normal' },
    ],
  });

  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  setHeader(event, 'Content-Type', 'image/png');
  setHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=3600');
  return png;
});
