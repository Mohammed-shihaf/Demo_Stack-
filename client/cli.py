import argparse
import sys
import httpx

def main():
    parser = argparse.ArgumentParser(description="Demo_Stack Python CLI Client")
    parser.add_argument("--url", default="http://localhost:8000", help="Backend base URL")
    subparsers = parser.add_subparsers(dest="command")

    # Health command
    subparsers.add_parser("health", help="Check server health")

    # List command
    subparsers.add_parser("list", help="List all records")

    # Create command
    create_parser = subparsers.add_parser("create", help="Create a new record")
    create_parser.add_argument("--title", required=True, help="Record title")
    create_parser.add_argument("--description", default="", help="Record description")

    args = parser.parse_args()

    if args.command == "health":
        r = httpx.get(f"{args.url}/health")
        print(r.json())
    elif args.command == "list":
        r = httpx.get(f"{args.url}/api/records")
        print(r.json())
    elif args.command == "create":
        r = httpx.post(f"{args.url}/api/records", json={"title": args.title, "description": args.description})
        print(r.json())
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
