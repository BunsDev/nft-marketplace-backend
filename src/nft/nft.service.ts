import { HttpService } from "@nestjs/axios";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import * as fs from "fs";
import { join } from "path";
import { NftPrepareDeployDto } from "./dto/nft-prepare-deploy";
import ipfsUpload from "./lib/ipfsUpload";

@Injectable()
export class NftService {
  constructor(private httpService: HttpService) {}

  async ipfs(image: Express.Multer.File) {
    try {
      const ipfsResult = await ipfsUpload(image);
      return ipfsResult[0];
    } catch (error) {
      throw new HttpException(
        `Error with upload on ipfs`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async prepareDeploy(
    nft: NftPrepareDeployDto,
    image: Express.Multer.File
  ): Promise<{
    tokenId: number;
    amount: number;
    uri: string;
  }> {
    const ipfsResult = await this.ipfs(image);

    const fileContent = JSON.stringify({
      description: nft.description,
      image: ipfsResult.hash,
      name: nft.name,
    });

    const amount = 1;
    const tokenId = 1;

    const directory = `${join(__dirname, "..", "..", "public")}/${nft.account}`;
    const filename = `000000000000000000000000000000000000000000000000000000000000000${tokenId}.json`;
    const filepath = `${directory}/${filename}`;

    return new Promise((resolve, reject) => {
      // creater folder
      fs.mkdir(directory, { recursive: true }, (err) => {
        if (err) {
          reject(err);
        }
        // create file
        fs.writeFile(filepath, fileContent, (err) => {
          if (err) {
            reject(err);
          }
          //"https://hostname/{id}.json"
          resolve({
            tokenId,
            amount,
            uri: `/${nft.account}/{id}.json`,
          });
        });
      });
    });
  }
}