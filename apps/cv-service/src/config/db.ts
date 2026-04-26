import mongoose from 'mongoose'

export async function connectDb() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/glybette-cv'
  await mongoose.connect(uri)
  console.log('[cv-service] MongoDB connected')
}

export async function disconnectDb() {
  await mongoose.disconnect()
}