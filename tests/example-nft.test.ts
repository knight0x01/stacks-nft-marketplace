import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("Example NFT Tests", () => {
  beforeEach(() => {
    simnet.setEpoch("2.4");
  });

  it("should mint an NFT successfully", () => {
    const { result } = simnet.callPublicFn(
      "example-nft",
      "mint",
      [Cl.principal(wallet1)],
      deployer
    );

    expect(result).toBeOk(Cl.uint(1));
  });

  it("should get last token ID", () => {
    simnet.callPublicFn(
      "example-nft",
      "mint",
      [Cl.principal(wallet1)],
      deployer
    );

    const { result } = simnet.callReadOnlyFn(
      "example-nft",
      "get-last-token-id",
      [],
      wallet1
    );

    expect(result).toBeOk(Cl.uint(1));
  });

  it("should transfer NFT successfully", () => {
    simnet.callPublicFn(
      "example-nft",
      "mint",
      [Cl.principal(wallet1)],
      deployer
    );

    const { result } = simnet.callPublicFn(
      "example-nft",
      "transfer",
      [Cl.uint(1), Cl.principal(wallet1), Cl.principal(wallet2)],
      wallet1
    );

    expect(result).toBeOk(Cl.bool(true));
  });

  it("should get token URI", () => {
    const { result } = simnet.callReadOnlyFn(
      "example-nft",
      "get-token-uri",
      [Cl.uint(1)],
      wallet1
    );

    expect(result).toBeOk(Cl.some(Cl.stringAscii("https://example.com/metadata/")));
  });
});
