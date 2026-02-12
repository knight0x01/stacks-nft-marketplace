import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("NFT Auction Tests", () => {
  beforeEach(() => {
    simnet.setEpoch("2.4");
  });

  it("should create an auction successfully", () => {
    const nftContract = deployer;
    const tokenId = Cl.uint(1);
    const startPrice = Cl.uint(1000000);
    const duration = Cl.uint(144); // ~24 hours

    const { result } = simnet.callPublicFn(
      "nft-auction",
      "create-auction",
      [Cl.principal(nftContract), tokenId, startPrice, duration],
      wallet1
    );

    expect(result).toBeOk(Cl.uint(1));
  });

  it("should place a bid successfully", () => {
    const nftContract = deployer;
    const tokenId = Cl.uint(1);
    const startPrice = Cl.uint(1000000);
    const duration = Cl.uint(144);

    simnet.callPublicFn(
      "nft-auction",
      "create-auction",
      [Cl.principal(nftContract), tokenId, startPrice, duration],
      wallet1
    );

    const { result } = simnet.callPublicFn(
      "nft-auction",
      "place-bid",
      [Cl.uint(1), Cl.uint(1500000)],
      wallet2
    );

    expect(result).toBeOk(Cl.bool(true));
  });

  it("should reject low bids", () => {
    const nftContract = deployer;
    const tokenId = Cl.uint(1);
    const startPrice = Cl.uint(1000000);
    const duration = Cl.uint(144);

    simnet.callPublicFn(
      "nft-auction",
      "create-auction",
      [Cl.principal(nftContract), tokenId, startPrice, duration],
      wallet1
    );

    const { result } = simnet.callPublicFn(
      "nft-auction",
      "place-bid",
      [Cl.uint(1), Cl.uint(500000)],
      wallet2
    );

    expect(result).toBeErr(Cl.uint(204)); // err-bid-too-low
  });
});
