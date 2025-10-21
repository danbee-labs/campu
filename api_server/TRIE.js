// Trie Node
import { basicSearch } from './utils.js';

class Node {
  constructor() {
    this.children = new Map();
    this.correct_array = [];
  }

  add_correct_array(info) {
    this.correct_array.push(info);
  }
}

// 요청대로 이름은 Trie로 둠 (Trie 동작)
export default class Trie {
  constructor() {
    this.root = new Node();
  }
  
  insert(info, key) {
    const str = info[key];
    const chunkStr = str.split(' ');
    for (const chunk of chunkStr) {
        let curNode = this.root;
        for (const ch of chunk) {
            if (!curNode.children.has(ch)) curNode.children.set(ch, new Node());
            curNode = curNode.children.get(ch);
            curNode.add_correct_array(info);
        }
    }
  }

  getStartWith(word) {
    let curNode = this.root;
    
    for (const ch of word) {
      if (!curNode.children.has(ch)) return []; 
      curNode = curNode.children.get(ch);
    }
    return curNode.correct_array;
  }
  searchWord(searchWord, key){
    const set = new Set();
    for (const word of searchWord.split(' ')) {
        console.log(this.getStartWith(word), word);
        const currentArr = basicSearch(this.getStartWith(word), key, searchWord);
        currentArr.forEach(info => {
          set.add(info);
        });
    }
    return [...set];
  }
}
