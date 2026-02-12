import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("NFT Marketplace Tests", () => {
  beforeEach(() => {
    simnet.setEpoch("2.4");
  });

  it("should create a listing successfully", () => {
    const nftContract = deployer;
    const tokenId = Cl.uint(1);
    const price = Cl.uint(1000000); // 1 STX

    const { result } = simnet.callPublicFn(
      "nft-marketplace",
      "create-listing",
      [Cl.principal(nftContract), tokenId, price],
      wallet1
    );

    expect(result).toBeOk(Cl.uint(1));
  });

  it("should cancel a listing", () => {
    const nftContract = deployer;
    const tokenId = Cl.uint(1);
    const price = Cl.uint(1000000);

    simnet.callPublicFn(
      "nft-marketplace",
      "create-listing",
      [Cl.principal(nftContract), tokenId, price],
      wallet1
    );

    const { result } = simnet.callPublicFn(
      "nft-marketplace",
      "cancel-listing",
      [Cl.uint(1)],
      wallet1
    );

    expect(result).toBeOk(Cl.bool(true));
  });

  it("should get platform fee", () => {
    const { result } = simnet.callReadOnlyFn(
      "nft-marketplace",
      "get-platform-fee",
      [],
      wallet1
    );

    expect(result).toBeOk(Cl.uint(250)); // 2.5%
  });

  it("should fail to cancel listing if not owner", () => {
    const nftContract = deployer;
    const tokenId = Cl.uint(1);
    const price = Cl.uint(1000000);

    simnet.callPublicFn(
      "nft-marketplace",
      "create-listing",
      [Cl.principal(nftContract), tokenId, price],
      wallet1
    );

    const { result } = simnet.callPublicFn(
      "nft-marketplace",
      "cancel-listing",
      [Cl.uint(1)],
      wallet2
    );

    expect(result).toBeErr(Cl.uint(103)); // err-unauthorized
  });
});
