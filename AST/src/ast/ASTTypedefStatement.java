package ast;

/**
 * @author SOON WEI JUN
 * this class is in charge of AST Node construction of typedef statement 
 * in C programs
 *
 */
public class ASTTypedefStatement extends ASTSimpleStatement {
	private static final String NODE_TYPE = "Typedef Statement";
	private String type;
	private String name;
	public ASTTypedefStatement() {
		super();
	}
	public ASTTypedefStatement(String type, String id) {
		this();
		this.type = type;
		this.name = id;
	}
	public String toSyntax(){
		this.result = "typedef " + this.type + " " + this.name + "\n";
		return this.result;
	}
	public String typeof(){
		return super.typeof()+"->"+NODE_TYPE;
	}
}
