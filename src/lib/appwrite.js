import { Client, Account, Databases } from 'appwrite'

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('69fc8a12000382a60cd0')

const account = new Account(client)
const databases = new Databases(client)

export { client, account, databases }
