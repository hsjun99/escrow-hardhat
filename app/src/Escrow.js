export default function Escrow({
    address,
    arbiter,
    beneficiary,
    value,
    handleApprove,
    isApproved,
    status,
}) {
    return (
        <div className="existing-contract">
            <ul className="fields">
                <li>
                    <div> Address </div>
                    <div> {address} </div>
                </li>
                <li>
                    <div> Arbiter </div>
                    <div> {arbiter} </div>
                </li>
                <li>
                    <div> Beneficiary </div>
                    <div> {beneficiary} </div>
                </li>
                <li>
                    <div> Value </div>
                    <div> {value} </div>
                </li>
                <li>
                    <div> Status </div>
                    <div> {status} </div>
                </li>
                <div
                    className={isApproved ? "complete" : "button"}
                    id={address}
                    onClick={(e) => {
                        e.preventDefault()

                        handleApprove()
                    }}
                >
                    {isApproved ? "✓ It's been approved!" : "Approve"}
                </div>
            </ul>
        </div>
    )
}
