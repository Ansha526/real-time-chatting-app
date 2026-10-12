import {MongoClient} from 'mongodb';
let connection,initialized;
export async function getDatabase(){if(!connection){const client=new MongoClient(process.env.MONGODB_URI,{maxPoolSize:5,minPoolSize:0,maxIdleTimeMS:10000,serverSelectionTimeoutMS:7000,connectTimeoutMS:7000});connection=client.connect().catch(e=>{connection=null;throw e;});}
 const client=await connection,db=client.db(process.env.MONGODB_DB||'circle_chat');
 if(!initialized)initialized=Promise.all([
 db.collection('groups').createIndex({inviteHash:1},{unique:true}),
 db.collection('members').createIndex({groupId:1,sessionHash:1},{unique:true}),
 db.collection('members').createIndex({sessionHash:1,joinedAt:-1}),
 db.collection('messages').createIndex({groupId:1,_id:-1}),
 db.collection('messages').createIndex({groupId:1,sessionHash:1,clientId:1},{unique:true}),
 db.collection('rate_limits').createIndex({expiresAt:1},{expireAfterSeconds:0})
 ]).catch(e=>{initialized=null;throw e});
 await initialized;return db;
}
