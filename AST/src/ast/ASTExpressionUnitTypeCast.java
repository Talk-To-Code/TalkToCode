package ast;
/**
 * @author SOON WEI JUN A0156192A
 * This class is mainly in charge of construction of AST nodes that represents
 * a typecast operation and its syntax generation.
 * This is available in C and Java only.
 */
public class ASTExpressionUnitTypeCast extends ASTExpressionUnit{
	private static final String NODE_TYPE = "Typecast";
	private String type;
	private ASTExpression exp;
	public ASTExpressionUnitTypeCast() {
		super();
	}

	public ASTExpressionUnitTypeCast(String id, ASTExpression exp){
		this();
		this.type = id;
		this.exp = exp;
	}
	
	public String toSyntax(){
		this.result = "(" + this.type + ") ";
		this.result += "(" + this.exp.toSyntax() + ")";
		if(this.isQuoted) quote();
		return super.toSyntax();
	}
	public String typeof() {
		return super.typeof()+"->"+NODE_TYPE;
	}
}
