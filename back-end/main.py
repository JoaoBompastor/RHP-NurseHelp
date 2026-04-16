def main():
    render_template("index.html")
    url_for('static', filename='style.css')
    return


if __name__ == "__main__":
    main()
