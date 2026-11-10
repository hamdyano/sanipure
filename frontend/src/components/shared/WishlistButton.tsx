import type { MouseEvent } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { isAuthenticated, signOut } from "../../api/clientApi";
import { isInWishlist, toggleWishlist, useWishlist } from "../../lib/wishlist";
import { showErrorToast, showSuccessToast } from "../../lib/toast";
import { openAuthPrompt } from "../../lib/authPrompt";

interface WishlistButtonProps {
  productId: string;
  productName: string;
  className?: string;
}

/**
 * Heart button that saves a product to the signed-in user's wishlist (shown
 * under "My Wishlist" on their profile). Visitors who aren't signed in are
 * sent to sign in first, then brought back to this page.
 */
const WishlistButton = ({ productId, productName, className = "" }: WishlistButtonProps) => {
  const location = useLocation();
  const wishlist = useWishlist();
  const saved = isInWishlist(wishlist, productId);

  // After signing in or up, the visitor comes back here with this product
  // already in their wishlist.
  const goToSignIn = () =>
    openAuthPrompt({
      from: `${location.pathname}${location.search}`,
      wishlistProduct: { id: productId, name: productName },
    });

  const handleClick = async (event: MouseEvent) => {
    // The button can sit inside or on top of a product link.
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated()) {
      goToSignIn();
      return;
    }

    try {
      const nowSaved = await toggleWishlist(productId);
      if (nowSaved) showSuccessToast("Added to your wishlist");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        signOut();
        showErrorToast("Your session expired. Please sign in again.");
        goToSignIn();
        return;
      }
      const message =
        axios.isAxiosError(err) && typeof err.response?.data?.message === "string"
          ? err.response.data.message
          : "Couldn't update your wishlist. Please try again.";
      showErrorToast(message);
    }
  };

  const label = saved
    ? `Remove ${productName} from your wishlist`
    : `Add ${productName} to your wishlist`;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      aria-pressed={saved}
      title={saved ? "Remove from wishlist" : "Add to wishlist"}
      className={`flex h-9 w-9 items-center justify-center rounded-md bg-white text-black shadow-md transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 20.5s-7.5-4.6-9.3-9.3C1.5 8 3.6 4.5 7.2 4.5c2 0 3.5 1.1 4.8 2.8 1.3-1.7 2.8-2.8 4.8-2.8 3.6 0 5.7 3.5 4.5 6.7-1.8 4.7-9.3 9.3-9.3 9.3Z" />
      </svg>
    </button>
  );
};

export default WishlistButton;
