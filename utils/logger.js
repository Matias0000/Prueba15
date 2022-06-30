const log4js = require ('log4js')
const path = require ('path')

log4js.configure({
   appenders: {
      myConsoleLogger: { type: 'console' },
      myWarningLogger: { type: 'file', filename: path.join(__dirname, '../logs/warnings.log') },
      myErrorLogger: { type: 'file', filename: path.join(__dirname, '../logs/error.log') },
   },
   categories: {
      default: { appenders: ['myConsoleLogger'], level: 'debug' },
      loggerInfo: { appenders: ['myConsoleLogger'], level: 'info' },
      loggerWarning: { appenders: ['myConsoleLogger', 'myWarningLogger'], level: 'warn' },
      loggerError: { appenders: ['myConsoleLogger', 'myErrorLogger'], level: 'error' },
   }
})

export const loggerInfo = log4js.getLogger('loggerInfo')
export const loggerWarning = log4js.getLogger('loggerWarning')
export const loggerError = log4js.getLogger('loggerError')