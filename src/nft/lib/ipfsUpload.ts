import * as fs from 'fs';
import * as ipfsAPI from 'ipfs-api';

type IpfsUploadResponse = {
  path: string;
  hash: string;
  size: number;
}[];
const ipfsUpload = async (
  image: Express.Multer.File,
): Promise<IpfsUploadResponse> => {
  const ipfs = ipfsAPI('ipfs.infura.io', '5001', { protocol: 'https' });
  const file = fs.readFileSync(image.path);
  return new Promise((resolve, reject) => {
    ipfs.files.add(file, function (err, file: IpfsUploadResponse) {
      if (err) {
        reject(err);
      }
      // delete after upload
      fs.unlinkSync(image.path);
      resolve(file);
    });
  });
};

export default ipfsUpload;
