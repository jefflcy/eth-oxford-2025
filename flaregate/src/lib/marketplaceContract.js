export const marketplaceAddress = "0x0F6436ce785a0b409BFB3eD6FBeF807d63434fd6"; //new
// export const marketplaceAddress = "0xEca1D7Dna19d03b059c255484171743ee3b7Db4D2"; //old
export const marketplaceABI = [
  {
    "inputs": [
      {
        "internalType": "string[]",
        "name": "_acceptedCurrencies",
        "type": "string[]"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "orderId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "by",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      }
    ],
    "name": "OrderAccepted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "orderId",
        "type": "uint256"
      }
    ],
    "name": "OrderCompleted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "orderId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "by",
        "type": "address"
      }
    ],
    "name": "OrderCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "orderId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "by",
        "type": "address"
      }
    ],
    "name": "OrderPaid",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "acceptOrder",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "acceptedCurrencies",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "allOrders",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "enum OrderStatus",
        "name": "status",
        "type": "uint8"
      },
      {
        "internalType": "address",
        "name": "onChainSeller",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "offChainBuyer",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "currency",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "cancelOrder",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "orderId",
        "type": "uint256"
      }
    ],
    "name": "claimTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "currency",
        "type": "string"
      }
    ],
    "name": "createOrder",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllOrders",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "enum OrderStatus",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "address",
            "name": "onChainSeller",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "offChainBuyer",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "price",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "currency",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "deadline",
            "type": "uint256"
          }
        ],
        "internalType": "struct Order[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "getOrder",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "enum OrderStatus",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "address",
            "name": "onChainSeller",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "offChainBuyer",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "price",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "currency",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "deadline",
            "type": "uint256"
          }
        ],
        "internalType": "struct Order",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "seller",
        "type": "address"
      }
    ],
    "name": "getOrdersByAddress",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "enum OrderStatus",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "address",
            "name": "onChainSeller",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "offChainBuyer",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "price",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "currency",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "deadline",
            "type": "uint256"
          }
        ],
        "internalType": "struct Order[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "curr",
        "type": "string"
      }
    ],
    "name": "isValidCurrency",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "purgeExpired",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "bytes32[]",
            "name": "merkleProof",
            "type": "bytes32[]"
          },
          {
            "components": [
              {
                "internalType": "bytes32",
                "name": "attestationType",
                "type": "bytes32"
              },
              {
                "internalType": "bytes32",
                "name": "sourceId",
                "type": "bytes32"
              },
              {
                "internalType": "uint64",
                "name": "votingRound",
                "type": "uint64"
              },
              {
                "internalType": "uint64",
                "name": "lowestUsedTimestamp",
                "type": "uint64"
              },
              {
                "components": [
                  {
                    "internalType": "string",
                    "name": "url",
                    "type": "string"
                  },
                  {
                    "internalType": "string",
                    "name": "postprocessJq",
                    "type": "string"
                  },
                  {
                    "internalType": "string",
                    "name": "abi_signature",
                    "type": "string"
                  }
                ],
                "internalType": "struct IJsonApi.RequestBody",
                "name": "requestBody",
                "type": "tuple"
              },
              {
                "components": [
                  {
                    "internalType": "bytes",
                    "name": "abi_encoded_data",
                    "type": "bytes"
                  }
                ],
                "internalType": "struct IJsonApi.ResponseBody",
                "name": "responseBody",
                "type": "tuple"
              }
            ],
            "internalType": "struct IJsonApi.Response",
            "name": "data",
            "type": "tuple"
          }
        ],
        "internalType": "struct IJsonApi.Proof",
        "name": "_proof",
        "type": "tuple"
      }
    ],
    "name": "recordFiatPayment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

export const FDC_HUB_ADDRESS_COSTON2 = "0x48aC463d7975828989331F4De43341627b9c5f1D"; // coston2
export const FDC_HUB_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "fee",
        "type": "uint256"
      }
    ],
    "name": "AttestationRequest",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint24",
        "name": "rewardEpochId",
        "type": "uint24"
      },
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "attestationType",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "source",
            "type": "bytes32"
          },
          {
            "internalType": "uint24",
            "name": "inflationShare",
            "type": "uint24"
          },
          {
            "internalType": "uint8",
            "name": "minRequestsThreshold",
            "type": "uint8"
          },
          {
            "internalType": "uint224",
            "name": "mode",
            "type": "uint224"
          }
        ],
        "indexed": false,
        "internalType": "struct IFdcInflationConfigurations.FdcConfiguration[]",
        "name": "fdcConfigurations",
        "type": "tuple[]"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "InflationRewardsOffered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "requestsOffsetSeconds",
        "type": "uint8"
      }
    ],
    "name": "RequestsOffsetSet",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "fdcInflationConfigurations",
    "outputs": [
      {
        "internalType": "contract IFdcInflationConfigurations",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "fdcRequestFeeConfigurations",
    "outputs": [
      {
        "internalType": "contract IFdcRequestFeeConfigurations",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "_data",
        "type": "bytes"
      }
    ],
    "name": "requestAttestation",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "requestsOffsetSeconds",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]