class ApiError(Exception):
    """Error that is returned to the client as {"error": {"code", "message"}}."""

    def __init__(self, code: str, message: str, status_code: int = 400):
        super().__init__(message)
        self.code = code
        self.message = message
        self.status_code = status_code