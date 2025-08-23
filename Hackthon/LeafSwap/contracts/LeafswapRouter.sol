// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/ILeafswapRouter.sol";
import "./interfaces/ILeafswapFactory.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IWETH.sol";
import "./libraries/SafeMath.sol";
import "./libraries/LeafswapLibrary.sol";
import "./LeafswapPair.sol";

contract LeafswapRouter is ILeafswapRouter {
    using SafeMath for uint256;

    address public immutable override factory;
    address public immutable override WETH;

    modifier ensure(uint256 deadline) {
        require(deadline >= block.timestamp, "LeafswapRouter: EXPIRED");
        _;
    }

    constructor(address _factory, address _WETH) {
        factory = _factory;
        WETH = _WETH;
    }

    receive() external payable {
        assert(msg.sender == WETH);
    }

    function _addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin
    ) internal virtual returns (uint256 amountA, uint256 amountB) {
        if (ILeafswapFactory(factory).getPair(tokenA, tokenB) == address(0)) {
            ILeafswapFactory(factory).createPair(tokenA, tokenB);
        }
        (uint256 reserveA, uint256 reserveB) = LeafswapLibrary.getReserves(factory, tokenA, tokenB);
        if (reserveA == 0 && reserveB == 0) {
            (amountA, amountB) = (amountADesired, amountBDesired);
        } else {
            uint256 amountBOptimal = LeafswapLibrary.quote(amountADesired, reserveA, reserveB);
            if (amountBOptimal <= amountBDesired) {
                require(amountBOptimal >= amountBMin, "LeafswapRouter: INSUFFICIENT_B_AMOUNT");
                (amountA, amountB) = (amountADesired, amountBOptimal);
            } else {
                uint256 amountAOptimal = LeafswapLibrary.quote(amountBDesired, reserveB, reserveA);
                assert(amountAOptimal <= amountADesired);
                require(amountAOptimal >= amountAMin, "LeafswapRouter: INSUFFICIENT_A_AMOUNT");
                (amountA, amountB) = (amountAOptimal, amountBDesired);
            }
        }
    }

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external virtual override ensure(deadline) returns (uint256 amountA, uint256 amountB, uint256 liquidity) {
        (amountA, amountB) = _addLiquidity(tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin);
        address pair = LeafswapLibrary.pairFor(factory, tokenA, tokenB);
        IERC20(tokenA).transferFrom(msg.sender, pair, amountA);
        IERC20(tokenB).transferFrom(msg.sender, pair, amountB);
        liquidity = LeafswapPair(pair).mint(to);
    }

    function addLiquidityETH(
        address token,
        uint256 amountTokenDesired,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline
    ) external virtual override ensure(deadline) payable returns (uint256 amountToken, uint256 amountETH, uint256 liquidity) {
        (amountToken, amountETH) = _addLiquidity(
            token,
            WETH,
            amountTokenDesired,
            msg.value,
            amountTokenMin,
            amountETHMin
        );
        address pair = LeafswapLibrary.pairFor(factory, token, WETH);
        IERC20(token).transferFrom(msg.sender, pair, amountToken);
        IWETH(WETH).deposit{value: amountETH}();
        assert(IWETH(WETH).transfer(pair, amountETH));
        liquidity = LeafswapPair(pair).mint(to);
        if (msg.value > amountETH) {
            IWETH(WETH).withdraw(msg.value - amountETH);
            payable(msg.sender).transfer(msg.value - amountETH);
        }
    }

    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) public virtual override ensure(deadline) returns (uint256 amountA, uint256 amountB) {
        address pair = LeafswapLibrary.pairFor(factory, tokenA, tokenB);
        IERC20(pair).transferFrom(msg.sender, pair, liquidity);
        (uint256 amount0, uint256 amount1) = LeafswapPair(pair).burn(to);
        (address token0,) = LeafswapLibrary.sortTokens(tokenA, tokenB);
        (amountA, amountB) = tokenA == token0 ? (amount0, amount1) : (amount1, amount0);
        require(amountA >= amountAMin, "LeafswapRouter: INSUFFICIENT_A_AMOUNT");
        require(amountB >= amountBMin, "LeafswapRouter: INSUFFICIENT_B_AMOUNT");
    }

    function removeLiquidityETH(
        address token,
        uint256 liquidity,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline
    ) public virtual override ensure(deadline) returns (uint256 amountToken, uint256 amountETH) {
        (amountToken, amountETH) = removeLiquidity(
            token,
            WETH,
            liquidity,
            amountTokenMin,
            amountETHMin,
            address(this),
            deadline
        );
        IERC20(token).transfer(to, amountToken);
        IWETH(WETH).withdraw(amountETH);
        payable(to).transfer(amountETH);
    }

    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external virtual override ensure(deadline) returns (uint256[] memory amounts) {
        amounts = LeafswapLibrary.getAmountsOut(factory, amountIn, path);
        require(amounts[amounts.length - 1] >= amountOutMin, "LeafswapRouter: INSUFFICIENT_OUTPUT_AMOUNT");
        IERC20(path[0]).transferFrom(msg.sender, LeafswapLibrary.pairFor(factory, path[0], path[1]), amounts[0]);
        _swap(amounts, path, to);
    }

    function swapTokensForExactTokens(
        uint256 amountOut,
        uint256 amountInMax,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external virtual override ensure(deadline) returns (uint256[] memory amounts) {
        amounts = LeafswapLibrary.getAmountsIn(factory, amountOut, path);
        require(amounts[0] <= amountInMax, "LeafswapRouter: EXCESSIVE_INPUT_AMOUNT");
        IERC20(path[0]).transferFrom(msg.sender, LeafswapLibrary.pairFor(factory, path[0], path[1]), amounts[0]);
        _swap(amounts, path, to);
    }

    function swapExactETHForTokens(
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external virtual override ensure(deadline) payable returns (uint256[] memory amounts) {
        require(path[0] == WETH, "LeafswapRouter: INVALID_PATH");
        amounts = LeafswapLibrary.getAmountsOut(factory, msg.value, path);
        require(amounts[amounts.length - 1] >= amountOutMin, "LeafswapRouter: INSUFFICIENT_OUTPUT_AMOUNT");
        IWETH(WETH).deposit{value: amounts[0]}();
        assert(IWETH(WETH).transfer(LeafswapLibrary.pairFor(factory, path[0], path[1]), amounts[0]));
        _swap(amounts, path, to);
    }

    function swapTokensForExactETH(
        uint256 amountOut,
        uint256 amountInMax,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external virtual override ensure(deadline) returns (uint256[] memory amounts) {
        require(path[path.length - 1] == WETH, "LeafswapRouter: INVALID_PATH");
        amounts = LeafswapLibrary.getAmountsIn(factory, amountOut, path);
        require(amounts[0] <= amountInMax, "LeafswapRouter: EXCESSIVE_INPUT_AMOUNT");
        IERC20(path[0]).transferFrom(msg.sender, LeafswapLibrary.pairFor(factory, path[0], path[1]), amounts[0]);
        _swap(amounts, path, address(this));
        IWETH(WETH).withdraw(amounts[amounts.length - 1]);
        payable(to).transfer(amounts[amounts.length - 1]);
    }

    function swapExactTokensForETH(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external virtual override ensure(deadline) returns (uint256[] memory amounts) {
        require(path[path.length - 1] == WETH, "LeafswapRouter: INVALID_PATH");
        amounts = LeafswapLibrary.getAmountsOut(factory, amountIn, path);
        require(amounts[amounts.length - 1] >= amountOutMin, "LeafswapRouter: INSUFFICIENT_OUTPUT_AMOUNT");
        IERC20(path[0]).transferFrom(msg.sender, LeafswapLibrary.pairFor(factory, path[0], path[1]), amounts[0]);
        _swap(amounts, path, address(this));
        IWETH(WETH).withdraw(amounts[amounts.length - 1]);
        payable(to).transfer(amounts[amounts.length - 1]);
    }

    function swapETHForExactTokens(
        uint256 amountOut,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external virtual override ensure(deadline) payable returns (uint256[] memory amounts) {
        require(path[0] == WETH, "LeafswapRouter: INVALID_PATH");
        amounts = LeafswapLibrary.getAmountsIn(factory, amountOut, path);
        require(amounts[0] <= msg.value, "LeafswapRouter: EXCESSIVE_INPUT_AMOUNT");
        IWETH(WETH).deposit{value: amounts[0]}();
        assert(IWETH(WETH).transfer(LeafswapLibrary.pairFor(factory, path[0], path[1]), amounts[0]));
        _swap(amounts, path, to);
        if (msg.value > amounts[0]) {
            IWETH(WETH).withdraw(msg.value - amounts[0]);
            payable(msg.sender).transfer(msg.value - amounts[0]);
        }
    }

    function _swap(uint256[] memory amounts, address[] memory path, address _to) internal virtual {
        for (uint256 i; i < path.length - 1; i++) {
            (address input, address output) = (path[i], path[i + 1]);
            (address token0,) = LeafswapLibrary.sortTokens(input, output);
            uint256 amountOut = amounts[i + 1];
            (uint256 amount0Out, uint256 amount1Out) = input == token0 ? (uint256(0), amountOut) : (amountOut, uint256(0));
            address to = i < path.length - 2 ? LeafswapLibrary.pairFor(factory, output, path[i + 2]) : _to;
            LeafswapPair(LeafswapLibrary.pairFor(factory, input, output)).swap(amount0Out, amount1Out, to, new bytes(0));
        }
    }

    function quote(uint256 amountA, uint256 reserveA, uint256 reserveB) public pure virtual override returns (uint256 amountB) {
        return LeafswapLibrary.quote(amountA, reserveA, reserveB);
    }

    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) public pure virtual override returns (uint256 amountOut) {
        return LeafswapLibrary.getAmountOut(amountIn, reserveIn, reserveOut);
    }

    function getAmountIn(uint256 amountOut, uint256 reserveIn, uint256 reserveOut) public pure virtual override returns (uint256 amountIn) {
        return LeafswapLibrary.getAmountIn(amountOut, reserveIn, reserveOut);
    }

    function getAmountsOut(uint256 amountIn, address[] memory path) public view virtual override returns (uint256[] memory amounts) {
        return LeafswapLibrary.getAmountsOut(factory, amountIn, path);
    }

    function getAmountsIn(uint256 amountOut, address[] memory path) public view virtual override returns (uint256[] memory amounts) {
        return LeafswapLibrary.getAmountsIn(factory, amountOut, path);
    }
}
