import { readFile } from 'fs/promises';

 const getJSONFromFile = async (filePath) => {
  const data = await readFile(filePath, 'utf-8');
  return await JSON.parse(data);
}

const FILE_PATH = './db/camping_data.json';

const data = await getJSONFromFile(FILE_PATH);
 
export default data;

function checkUnique(arrs, key){
    const unique = new Set();
    for(const arr of arrs){
        unique.add(arr[key]);
    }
    return unique.size === arrs.length;
}

function test(){
    console.log('Total records:', data.length);
    console.log('Unique addresses:', checkUnique(data, 'address'));
    console.log('Unique names:', checkUnique(data, 'name'));
}

// test();