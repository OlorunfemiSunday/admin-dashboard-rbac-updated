const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const os = require('os');
const path = require('path');

exports.exportLogs = async (logs) => {
  const filePath = path.join(os.tmpdir(), `logs_export_${Date.now()}.csv`);
  const csvWriter = createCsvWriter({
    path: filePath,
    header: [
      {id: 'timestamp', title: 'timestamp'},
      {id: 'user', title: 'user'},
      {id: 'actionType', title: 'actionType'},
      {id: 'ip', title: 'ip'},
      {id: 'meta', title: 'meta'}
    ]
  });
  const records = logs.map(l => ({
    timestamp: l.timestamp.toISOString(),
    user: l.user ? (l.user.email || l.user._id.toString()) : '',
    actionType: l.actionType,
    ip: l.ip || '',
    meta: l.meta ? JSON.stringify(l.meta) : ''
  }));
  await csvWriter.writeRecords(records);
  return filePath;
};