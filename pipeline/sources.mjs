const host = 'https://health.data.ny.gov';
export const terms = {
  url: 'https://data.ny.gov/download/77gx-ii52/application/pdf',
  fileUrl: 'https://data.ny.gov/api/views/77gx-ii52/files/ef0c1840-ad54-4240-92fd-6397c49fde46?filename=OPEN-NY_20Terms_20of_20Use.pdf',
  sha256: '9437c849705d58df008f01fc23f404444becce6b86676adc3974f9160a4cb650',
  reviewedAt: '2026-10-02'
};
export const procedures = {
  PGN003: 'CESAREAN SECTION', PGN002: 'SPONTANEOUS VAGINAL DELIVERY', FRS001: 'HYSTERECTOMY'
};
export const fields = ['ccsr_procedure_code', 'ccsr_procedure_description', 'discharge_year', 'length_of_stay'];

const reviewed = {
  2023: {id: '46xm-urtu',
    overview: ['c1844a97-cb39-4f72-80fd-6d24bab9f931', '0e02fe5b02f040bdee040b655dc9e43fce0ccb80edd1030a92e3944e92d221d9'],
    dictionary: ['cf754ac6-e5d5-47f2-88aa-e91a741a4ea0', '8530da2d365c9344f155696bf58671a7273d84c830ccde36d632eb13a94833e8']},
  2024: {id: 'sf4k-39ay',
    overview: ['4569ea58-f227-4251-8d10-869f070c0444', '929924be8bdcc8270e54548ce407e84d2ceac6371ad76d103d05a7e656c9fed6'],
    dictionary: ['a768e7f9-db7a-42ce-bedc-e2c88186c687', '9cc34b24c1c2f20556b218ba43899b45cc63eda87c5a32177081d6e6eff6ee31']}
};

export function sourceFor(year) {
  if (![2023, 2024].includes(year)) throw new Error('Only the reviewed 2023 and 2024 releases are supported.');
  const source = reviewed[year];
  return {year, datasetId: source.id, codingVersion: 'CCSR 2025.1',
    stayLabelMapping: {'120 +': '120+'},
    name: 'Hospital Inpatient Discharges (SPARCS De-Identified): ' + year,
    metadataUrl: host + '/api/views/' + source.id + '.json',
    resourceUrl: host + '/resource/' + source.id + '.json',
    datasetUrl: host + '/d/' + source.id,
    documents: ['overview', 'dictionary'].map(kind => ({kind,
      assetId: source[kind][0], sha256: source[kind][1],
      url: host + '/api/views/' + source.id + '/files/' + source[kind][0] + '?download=true'}))};
}

export function queryUrls(year) {
  const source = sourceFor(year);
  const urlFor = parameters => {
    const url = new URL(source.resourceUrl);
    for (const [key, value] of Object.entries(parameters)) url.searchParams.set('$' + key, value);
    return url.href;
  };
  const where = "discharge_year='" + year + "'";
  return {histogram: urlFor({
    select: 'ccsr_procedure_code as procedure_code,ccsr_procedure_description as procedure_description,discharge_year as year,length_of_stay,count(*) as discharges',
    where: where + ' and ccsr_procedure_code in(' + Object.keys(procedures).map(code => "'" + code + "'").join(',') + ')',
    group: fields.join(','), order: 'ccsr_procedure_code,length_of_stay', limit: '361'}),
    totals: Object.fromEntries(Object.keys(procedures).map(code => [code, urlFor({
      select: 'count(*) as discharges', where: where + " and ccsr_procedure_code='" + code + "'", limit: '2'})]))};
}
