import db from './db/index.js';
import Trie from './TRIE.js';

const nameTrie = new Trie();
const addressTrie = new Trie();

for (const info of db) {
  nameTrie.insert(info, 'name');
  addressTrie.insert(info, 'address');
}

export  { addressTrie, nameTrie };