package ast;

/**
 * @author GAO RISHENG A0101891L
 * this class is mainly for construction of AST nodes representing literals and values in
 * programs
 * This is available for all C/JAVA/Python programs
 */
public class ASTExpressionUnitLiteral extends ASTExpressionUnit{
	private static final String NODE_TYPE = "Value";
	private String value;
	public ASTExpressionUnitLiteral(){
		super();
	}

	public ASTExpressionUnitLiteral(String value){
		super();
		this.value = value;
	}
	//syntax construction
	public String typeof(){
		return super.typeof()+"->"+NODE_TYPE;
	}
	public String toSyntax(){
		return this.value;
	}
}
