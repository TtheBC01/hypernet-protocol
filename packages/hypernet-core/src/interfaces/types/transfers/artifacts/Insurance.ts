export default {
  _format: "hh-sol-artifact-1",
  contractName: "Insurance",
  sourceName: "contracts/insurance/Insurance.sol",
  abi: [
    {
      inputs: [],
      name: "Name",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "ResolverEncoding",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "StateEncoding",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes",
          name: "encodedBalance",
          type: "bytes",
        },
        {
          internalType: "bytes",
          name: "encodedState",
          type: "bytes",
        },
      ],
      name: "create",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getRegistryInformation",
      outputs: [
        {
          components: [
            {
              internalType: "string",
              name: "name",
              type: "string",
            },
            {
              internalType: "address",
              name: "definition",
              type: "address",
            },
            {
              internalType: "string",
              name: "stateEncoding",
              type: "string",
            },
            {
              internalType: "string",
              name: "resolverEncoding",
              type: "string",
            },
          ],
          internalType: "struct RegisteredTransfer",
          name: "",
          type: "tuple",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes",
          name: "encodedBalance",
          type: "bytes",
        },
        {
          internalType: "bytes",
          name: "encodedState",
          type: "bytes",
        },
        {
          internalType: "bytes",
          name: "encodedResolver",
          type: "bytes",
        },
      ],
      name: "resolve",
      outputs: [
        {
          components: [
            {
              internalType: "uint256[2]",
              name: "amount",
              type: "uint256[2]",
            },
            {
              internalType: "address payable[2]",
              name: "to",
              type: "address[2]",
            },
          ],
          internalType: "struct Balance",
          name: "",
          type: "tuple",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ],
  bytecode:
    "0x608060405234801561001057600080fd5b506112c4806100206000396000f3fe608060405234801561001057600080fd5b50600436106100625760003560e01c8063206162be146100675780633722aff9146100855780638052474d1461009a5780638de8b77e146100a25780638ef98a7e146100aa57806394184ba9146100ca575b600080fd5b61006f6100ea565b60405161007c91906110db565b60405180910390f35b61008d61027c565b60405161007c9190610cc7565b61008d610298565b61008d6102bd565b6100bd6100b8366004610926565b6102d9565b60405161007c9190611071565b6100dd6100d83660046108bd565b610471565b60405161007c9190610c9e565b6100f261079d565b6040518060800160405280306001600160a01b0316638052474d6040518163ffffffff1660e01b815260040160006040518083038186803b15801561013657600080fd5b505afa15801561014a573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405261017291908101906109bc565b8152602001306001600160a01b03168152602001306001600160a01b0316638de8b77e6040518163ffffffff1660e01b815260040160006040518083038186803b1580156101bf57600080fd5b505afa1580156101d3573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526101fb91908101906109bc565b8152602001306001600160a01b0316633722aff96040518163ffffffff1660e01b815260040160006040518083038186803b15801561023957600080fd5b505afa15801561024d573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405261027591908101906109bc565b9052905090565b60405180606001604052806040815260200161124f6040913981565b60405180604001604052806009815260200168496e737572616e636560b81b81525081565b6040518060800160405280605f81526020016111f0605f913981565b6102e16107ce565b6102e96107ce565b6102f587890189610a34565b90506102ff6107f3565b61030b86880188610bdc565b9050610315610821565b61032185870187610b06565b905061032b610841565b508051602081015160808401511461035e5760405162461bcd60e51b815260040161035590610f2d565b60405180910390fd5b826060015142106103755783945050505050610467565b6000816040516020016103889190611145565b60405160208183030381529060405280519060200120905060006103b082856020015161058f565b905084600001516001600160a01b0316816001600160a01b031614156103de57859650505050505050610467565b84602001516001600160a01b0316816001600160a01b0316146104135760405162461bcd60e51b815260040161035590610e47565b855151835111156104365760405162461bcd60e51b815260040161035590610d7f565b8251865151610444916105af565b8651528251865160200151610458916105f8565b86516020015250939450505050505b9695505050505050565b600061047b6107ce565b61048785870187610a34565b90506104916107f3565b61049d84860186610bdc565b825160200151909150156104c35760405162461bcd60e51b815260040161035590610e7e565b426203f480018160600151116104eb5760405162461bcd60e51b815260040161035590611020565b80516001600160a01b03166105125760405162461bcd60e51b815260040161035590610f5a565b60208101516001600160a01b031661053c5760405162461bcd60e51b815260040161035590610fd4565b608081015161055d5760405162461bcd60e51b815260040161035590610fa6565b6001816040015110156105825760405162461bcd60e51b815260040161035590610e10565b5060019695505050505050565b60008061059b8461061d565b90506105a7818461064d565b949350505050565b60006105f183836040518060400160405280601e81526020017f536166654d6174683a207375627472616374696f6e206f766572666c6f770000815250610771565b9392505050565b6000828201838110156105f15760405162461bcd60e51b815260040161035590610d48565b6000816040516020016106309190610c6d565b604051602081830303815290604052805190602001209050919050565b600081516041146106705760405162461bcd60e51b815260040161035590610d11565b60208201516040830151606084015160001a7f7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a08211156106c25760405162461bcd60e51b815260040161035590610dce565b8060ff16601b141580156106da57508060ff16601c14155b156106f75760405162461bcd60e51b815260040161035590610eeb565b60006001878386866040516000815260200160405260405161071c9493929190610ca9565b6020604051602081039080840390855afa15801561073e573d6000803e3d6000fd5b5050604051601f1901519150506001600160a01b0381166104675760405162461bcd60e51b815260040161035590610cda565b600081848411156107955760405162461bcd60e51b81526004016103559190610cc7565b505050900390565b60405180608001604052806060815260200160006001600160a01b0316815260200160608152602001606081525090565b60405180604001604052806107e1610858565b81526020016107ee610858565b905290565b6040805160a08101825260008082526020820181905291810182905260608101829052608081019190915290565b6040518060400160405280610834610841565b8152602001606081525090565b604080518082019091526000808252602082015290565b60405180604001604052806002906020820280368337509192915050565b60008083601f840112610887578182fd5b50813567ffffffffffffffff81111561089e578182fd5b6020830191508360208285010111156108b657600080fd5b9250929050565b600080600080604085870312156108d2578384fd5b843567ffffffffffffffff808211156108e9578586fd5b6108f588838901610876565b9096509450602087013591508082111561090d578384fd5b5061091a87828801610876565b95989497509550505050565b6000806000806000806060878903121561093e578182fd5b863567ffffffffffffffff80821115610955578384fd5b6109618a838b01610876565b90985096506020890135915080821115610979578384fd5b6109858a838b01610876565b9096509450604089013591508082111561099d578384fd5b506109aa89828a01610876565b979a9699509497509295939492505050565b6000602082840312156109cd578081fd5b815167ffffffffffffffff8111156109e3578182fd5b8201601f810184136109f3578182fd5b8051610a06610a0182611183565b61115c565b818152856020838501011115610a1a578384fd5b610a2b8260208301602086016111a7565b95945050505050565b600060808284031215610a45578081fd5b610a4f604061115c565b83601f840112610a5d578182fd5b610a67604061115c565b80846040860187811115610a79578586fd5b855b6002811015610a9a578235855260209485019490920191600101610a7b565b5082855287605f880112610aac578586fd5b610ab6604061115c565b9350839250905060808601871015610acc578485fd5b845b6002811015610af7578135610ae2816111d7565b84526020938401939190910190600101610ace565b50506020830152509392505050565b60006020808385031215610b18578182fd5b823567ffffffffffffffff80821115610b2f578384fd5b908401908186036060811215610b43578485fd5b610b4d604061115c565b6040821215610b5a578586fd5b610b64604061115c565b84358152858501358682015281526040840135915082821115610b85578586fd5b818401935087601f850112610b98578586fd5b83359250610ba8610a0184611183565b91508282528785848601011115610bbd578586fd5b8285850186840137918101840194909452918201929092529392505050565b600060a08284031215610bed578081fd5b610bf760a061115c565b8235610c02816111d7565b81526020830135610c12816111d7565b806020830152506040830135604082015260608301356060820152608083013560808201528091505092915050565b60008151808452610c598160208601602086016111a7565b601f01601f19169290920160200192915050565b7f15496e647261205369676e6564204d6573736167653a0a3332000000000000008152601981019190915260390190565b901515815260200190565b93845260ff9290921660208401526040830152606082015260800190565b6000602082526105f16020830184610c41565b60208082526018908201527f45434453413a20696e76616c6964207369676e61747572650000000000000000604082015260600190565b6020808252601f908201527f45434453413a20696e76616c6964207369676e6174757265206c656e67746800604082015260600190565b6020808252601b908201527f536166654d6174683a206164646974696f6e206f766572666c6f770000000000604082015260600190565b6020808252602f908201527f43616e6e6f74207472616e73666572206d6f7265207468616e206f726967696e60408201526e30b6363c9030b63637b1b0ba32b21760891b606082015260800190565b60208082526022908201527f45434453413a20696e76616c6964207369676e6174757265202773272076616c604082015261756560f01b606082015260800190565b6020808252601a908201527f436f6c6c61746572616c206d757374206265206e6f6e7a65726f000000000000604082015260600190565b60208082526019908201527f5369676e617475726520646964206e6f74207665726966792100000000000000604082015260600190565b60208082526047908201527f43616e6e6f742063726561746520706172616d65746572697a6564207061796d60408201527f656e742077697468206e6f6e7a65726f20726563697069656e7420696e69742060608201526662616c616e636560c81b608082015260a00190565b60208082526022908201527f45434453413a20696e76616c6964207369676e6174757265202776272076616c604082015261756560f01b606082015260800190565b6020808252601390820152725555494420646964206e6f74206d617463682160681b604082015260600190565b6020808252602c908201527f526563656976657220616464726573732063616e6e6f7420626520746865207a60408201526b65726f20616464726573732160a01b606082015260800190565b6020808252601490820152732aaaa4a21031b0b73737ba10313290373ab6361760611b604082015260600190565b6020808252602c908201527f4d65646961746f7220616464726573732063616e6e6f7420626520746865207a60408201526b65726f20616464726573732160a01b606082015260800190565b60208082526031908201527f45787069726174696f6e206d757374206265206174206c6561737420332064616040820152703cb99034b7103a343290333aba3ab9329760791b606082015260800190565b815160808201908260005b600281101561109b57825182526020928301929091019060010161107c565b5050506020808401516040840160005b60028110156110d15782516001600160a01b0316825291830191908301906001016110ab565b5050505092915050565b6000602082528251608060208401526110f760a0840182610c41565b905060018060a01b0360208501511660408401526040840151601f19808584030160608601526111278383610c41565b9250606086015191508085840301608086015250610a2b8282610c41565b815181526020918201519181019190915260400190565b60405181810167ffffffffffffffff8111828210171561117b57600080fd5b604052919050565b600067ffffffffffffffff821115611199578081fd5b50601f01601f191660200190565b60005b838110156111c25781810151838201526020016111aa565b838111156111d1576000848401525b50505050565b6001600160a01b03811681146111ec57600080fd5b5056fe7475706c6528616464726573732072656365697665722c2061646472657373206d65646961746f722c2075696e7432353620636f6c6c61746572616c2c2075696e743235362065787069726174696f6e2c20627974657333322055554944297475706c65287475706c652875696e7432353620616d6f756e742c206279746573333220555549442920646174612c206279746573207369676e617475726529a26469706673582212203de199e3386df710f8118c9a2df72de99e792ae19b821cd41cf86b7555c7345e64736f6c63430007010033",
  deployedBytecode:
    "0x608060405234801561001057600080fd5b50600436106100625760003560e01c8063206162be146100675780633722aff9146100855780638052474d1461009a5780638de8b77e146100a25780638ef98a7e146100aa57806394184ba9146100ca575b600080fd5b61006f6100ea565b60405161007c91906110db565b60405180910390f35b61008d61027c565b60405161007c9190610cc7565b61008d610298565b61008d6102bd565b6100bd6100b8366004610926565b6102d9565b60405161007c9190611071565b6100dd6100d83660046108bd565b610471565b60405161007c9190610c9e565b6100f261079d565b6040518060800160405280306001600160a01b0316638052474d6040518163ffffffff1660e01b815260040160006040518083038186803b15801561013657600080fd5b505afa15801561014a573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405261017291908101906109bc565b8152602001306001600160a01b03168152602001306001600160a01b0316638de8b77e6040518163ffffffff1660e01b815260040160006040518083038186803b1580156101bf57600080fd5b505afa1580156101d3573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526101fb91908101906109bc565b8152602001306001600160a01b0316633722aff96040518163ffffffff1660e01b815260040160006040518083038186803b15801561023957600080fd5b505afa15801561024d573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405261027591908101906109bc565b9052905090565b60405180606001604052806040815260200161124f6040913981565b60405180604001604052806009815260200168496e737572616e636560b81b81525081565b6040518060800160405280605f81526020016111f0605f913981565b6102e16107ce565b6102e96107ce565b6102f587890189610a34565b90506102ff6107f3565b61030b86880188610bdc565b9050610315610821565b61032185870187610b06565b905061032b610841565b508051602081015160808401511461035e5760405162461bcd60e51b815260040161035590610f2d565b60405180910390fd5b826060015142106103755783945050505050610467565b6000816040516020016103889190611145565b60405160208183030381529060405280519060200120905060006103b082856020015161058f565b905084600001516001600160a01b0316816001600160a01b031614156103de57859650505050505050610467565b84602001516001600160a01b0316816001600160a01b0316146104135760405162461bcd60e51b815260040161035590610e47565b855151835111156104365760405162461bcd60e51b815260040161035590610d7f565b8251865151610444916105af565b8651528251865160200151610458916105f8565b86516020015250939450505050505b9695505050505050565b600061047b6107ce565b61048785870187610a34565b90506104916107f3565b61049d84860186610bdc565b825160200151909150156104c35760405162461bcd60e51b815260040161035590610e7e565b426203f480018160600151116104eb5760405162461bcd60e51b815260040161035590611020565b80516001600160a01b03166105125760405162461bcd60e51b815260040161035590610f5a565b60208101516001600160a01b031661053c5760405162461bcd60e51b815260040161035590610fd4565b608081015161055d5760405162461bcd60e51b815260040161035590610fa6565b6001816040015110156105825760405162461bcd60e51b815260040161035590610e10565b5060019695505050505050565b60008061059b8461061d565b90506105a7818461064d565b949350505050565b60006105f183836040518060400160405280601e81526020017f536166654d6174683a207375627472616374696f6e206f766572666c6f770000815250610771565b9392505050565b6000828201838110156105f15760405162461bcd60e51b815260040161035590610d48565b6000816040516020016106309190610c6d565b604051602081830303815290604052805190602001209050919050565b600081516041146106705760405162461bcd60e51b815260040161035590610d11565b60208201516040830151606084015160001a7f7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a08211156106c25760405162461bcd60e51b815260040161035590610dce565b8060ff16601b141580156106da57508060ff16601c14155b156106f75760405162461bcd60e51b815260040161035590610eeb565b60006001878386866040516000815260200160405260405161071c9493929190610ca9565b6020604051602081039080840390855afa15801561073e573d6000803e3d6000fd5b5050604051601f1901519150506001600160a01b0381166104675760405162461bcd60e51b815260040161035590610cda565b600081848411156107955760405162461bcd60e51b81526004016103559190610cc7565b505050900390565b60405180608001604052806060815260200160006001600160a01b0316815260200160608152602001606081525090565b60405180604001604052806107e1610858565b81526020016107ee610858565b905290565b6040805160a08101825260008082526020820181905291810182905260608101829052608081019190915290565b6040518060400160405280610834610841565b8152602001606081525090565b604080518082019091526000808252602082015290565b60405180604001604052806002906020820280368337509192915050565b60008083601f840112610887578182fd5b50813567ffffffffffffffff81111561089e578182fd5b6020830191508360208285010111156108b657600080fd5b9250929050565b600080600080604085870312156108d2578384fd5b843567ffffffffffffffff808211156108e9578586fd5b6108f588838901610876565b9096509450602087013591508082111561090d578384fd5b5061091a87828801610876565b95989497509550505050565b6000806000806000806060878903121561093e578182fd5b863567ffffffffffffffff80821115610955578384fd5b6109618a838b01610876565b90985096506020890135915080821115610979578384fd5b6109858a838b01610876565b9096509450604089013591508082111561099d578384fd5b506109aa89828a01610876565b979a9699509497509295939492505050565b6000602082840312156109cd578081fd5b815167ffffffffffffffff8111156109e3578182fd5b8201601f810184136109f3578182fd5b8051610a06610a0182611183565b61115c565b818152856020838501011115610a1a578384fd5b610a2b8260208301602086016111a7565b95945050505050565b600060808284031215610a45578081fd5b610a4f604061115c565b83601f840112610a5d578182fd5b610a67604061115c565b80846040860187811115610a79578586fd5b855b6002811015610a9a578235855260209485019490920191600101610a7b565b5082855287605f880112610aac578586fd5b610ab6604061115c565b9350839250905060808601871015610acc578485fd5b845b6002811015610af7578135610ae2816111d7565b84526020938401939190910190600101610ace565b50506020830152509392505050565b60006020808385031215610b18578182fd5b823567ffffffffffffffff80821115610b2f578384fd5b908401908186036060811215610b43578485fd5b610b4d604061115c565b6040821215610b5a578586fd5b610b64604061115c565b84358152858501358682015281526040840135915082821115610b85578586fd5b818401935087601f850112610b98578586fd5b83359250610ba8610a0184611183565b91508282528785848601011115610bbd578586fd5b8285850186840137918101840194909452918201929092529392505050565b600060a08284031215610bed578081fd5b610bf760a061115c565b8235610c02816111d7565b81526020830135610c12816111d7565b806020830152506040830135604082015260608301356060820152608083013560808201528091505092915050565b60008151808452610c598160208601602086016111a7565b601f01601f19169290920160200192915050565b7f15496e647261205369676e6564204d6573736167653a0a3332000000000000008152601981019190915260390190565b901515815260200190565b93845260ff9290921660208401526040830152606082015260800190565b6000602082526105f16020830184610c41565b60208082526018908201527f45434453413a20696e76616c6964207369676e61747572650000000000000000604082015260600190565b6020808252601f908201527f45434453413a20696e76616c6964207369676e6174757265206c656e67746800604082015260600190565b6020808252601b908201527f536166654d6174683a206164646974696f6e206f766572666c6f770000000000604082015260600190565b6020808252602f908201527f43616e6e6f74207472616e73666572206d6f7265207468616e206f726967696e60408201526e30b6363c9030b63637b1b0ba32b21760891b606082015260800190565b60208082526022908201527f45434453413a20696e76616c6964207369676e6174757265202773272076616c604082015261756560f01b606082015260800190565b6020808252601a908201527f436f6c6c61746572616c206d757374206265206e6f6e7a65726f000000000000604082015260600190565b60208082526019908201527f5369676e617475726520646964206e6f74207665726966792100000000000000604082015260600190565b60208082526047908201527f43616e6e6f742063726561746520706172616d65746572697a6564207061796d60408201527f656e742077697468206e6f6e7a65726f20726563697069656e7420696e69742060608201526662616c616e636560c81b608082015260a00190565b60208082526022908201527f45434453413a20696e76616c6964207369676e6174757265202776272076616c604082015261756560f01b606082015260800190565b6020808252601390820152725555494420646964206e6f74206d617463682160681b604082015260600190565b6020808252602c908201527f526563656976657220616464726573732063616e6e6f7420626520746865207a60408201526b65726f20616464726573732160a01b606082015260800190565b6020808252601490820152732aaaa4a21031b0b73737ba10313290373ab6361760611b604082015260600190565b6020808252602c908201527f4d65646961746f7220616464726573732063616e6e6f7420626520746865207a60408201526b65726f20616464726573732160a01b606082015260800190565b60208082526031908201527f45787069726174696f6e206d757374206265206174206c6561737420332064616040820152703cb99034b7103a343290333aba3ab9329760791b606082015260800190565b815160808201908260005b600281101561109b57825182526020928301929091019060010161107c565b5050506020808401516040840160005b60028110156110d15782516001600160a01b0316825291830191908301906001016110ab565b5050505092915050565b6000602082528251608060208401526110f760a0840182610c41565b905060018060a01b0360208501511660408401526040840151601f19808584030160608601526111278383610c41565b9250606086015191508085840301608086015250610a2b8282610c41565b815181526020918201519181019190915260400190565b60405181810167ffffffffffffffff8111828210171561117b57600080fd5b604052919050565b600067ffffffffffffffff821115611199578081fd5b50601f01601f191660200190565b60005b838110156111c25781810151838201526020016111aa565b838111156111d1576000848401525b50505050565b6001600160a01b03811681146111ec57600080fd5b5056fe7475706c6528616464726573732072656365697665722c2061646472657373206d65646961746f722c2075696e7432353620636f6c6c61746572616c2c2075696e743235362065787069726174696f6e2c20627974657333322055554944297475706c65287475706c652875696e7432353620616d6f756e742c206279746573333220555549442920646174612c206279746573207369676e617475726529a26469706673582212203de199e3386df710f8118c9a2df72de99e792ae19b821cd41cf86b7555c7345e64736f6c63430007010033",
  linkReferences: {},
  deployedLinkReferences: {},
};