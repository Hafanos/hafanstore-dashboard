import { blFetch } from '@/lib/bricklink';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  let setNumber = searchParams.get('set')?.trim();
  const condition = searchParams.get('condition') === 'U' ? 'U' : 'N';

  if (!setNumber) {
    return Response.json({ error: 'Missing set' }, { status: 400 });
  }

  // BrickLink requires the variant suffix; default to -1 when omitted.
  if (!setNumber.includes('-')) {
    setNumber = `${setNumber}-1`;
  }

  try {
    const data = await blFetch(`/items/S/${setNumber}/price`, {
      guide_type: 'sold',
      new_or_used: condition,
    });

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentSales = (data.price_detail ?? []).filter(
      p => p.date_ordered && new Date(p.date_ordered) >= sixMonthsAgo,
    );

    const totalUnits = recentSales.reduce((s, p) => s + (p.quantity || 1), 0);
    const totalValue = recentSales.reduce(
      (s, p) => s + parseFloat(p.unit_price || 0) * (p.quantity || 1),
      0,
    );
    const avgSoldPrice = totalUnits > 0 ? totalValue / totalUnits : 0;
    const salesPerMonth = totalUnits / 6;

    return Response.json({
      set: setNumber,
      condition,
      avgSoldPrice,
      salesPerMonth,
      totalUnits,
      sampleSize: recentSales.length,
      currencyCode: data.currency_code || 'USD',
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 502 });
  }
}
