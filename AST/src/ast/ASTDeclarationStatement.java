package ast;

/**
 * @author GAO RISHENG A0101891L
 * This class is mainly in charge of construction of ASTnode that represents
 * variable declaration statement.
 */
public class ASTDeclarationStatement extends ASTSimpleStatement {
	private static final String NODE_TYPE = "Declaration Statement";
	public ASTDeclarationStatement() {
		super();
	}
	//virtual method
	public String toSyntax(){
		this.result = "\n";
		return this.result;
	}
	public String typeof(){
		return super.typeof()+"->"+NODE_TYPE;
	}

}
